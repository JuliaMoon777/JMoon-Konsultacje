import { Redis } from '@upstash/redis';

export type ServiceType =
  | 'KODY CIAŁA'
  | 'Indywidualna prognoza miesiąca'
  | 'EKSPRESOWA ANALIZA MATRYCY LOSU';

export interface Review {
  id: string;
  name: string;
  author?: string; // Backwards compatibility
  service: ServiceType;
  rating: number;
  text: string;
  date: string;
  published: boolean;
}

export interface ReviewStats {
  total: number;
  published: number;
  hidden: number;
  averageRating: number;
  byService: {
    kodyCiala: number;
    indywidualnaPrognoza: number;
    ekspresowaAnaliza: number;
  };
}

export const ALLOWED_SERVICES: ServiceType[] = [
  'KODY CIAŁA',
  'Indywidualna prognoza miesiąca',
  'EKSPRESOWA ANALIZA MATRYCY LOSU',
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-agnieszka-matrix-1',
    name: 'Agnieszka',
    author: 'Agnieszka',
    service: 'EKSPRESOWA ANALIZA MATRYCY LOSU',
    rating: 5,
    text: `„Julio, dziękuję Ci za poświęcony czas i za odpowiedzi na moje pytania. Cieszę się, że mogłam chwilę z Tobą porozmawiać.

Imponuje mi Twoja intuicja i wiedza na temat liczb i wyczucie. Dziękuję za to, co robisz.

I dziękuję za dzisiejszy dzień. ☺️ Życzę Ci wszystkiego dobrego :)

PS. Twój sposób tłumaczenia bardzo do mnie trafia. Ciepły głos i prosty przekaz są super.”`,
    date: 'Zweryfikowana opinia',
    published: true,
  },
];

const REDIS_KEY = 'jmoon_reviews';

// In-memory cache for fast response within the same serverless container lifecycle
let inMemoryReviews: Review[] | null = null;
let cachedRedisClient: Redis | null = null;
let hasLoggedRedisError = false;

/**
 * Normalizes Redis credentials from various supported environment variables:
 * - KV_REST_API_URL / KV_REST_API_TOKEN (Vercel KV)
 * - UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN (Upstash Redis REST)
 * - rediss:// or redis:// standard connection strings (auto-converted to REST endpoint https://<hostname>)
 */
function normalizeRedisCredentials(): { url: string; token: string } | null {
  const candidateUrls = [
    process.env.KV_REST_API_URL,
    process.env.UPSTASH_REDIS_REST_URL,
    process.env.UPSTASH_REDIS_URL,
    process.env.REDIS_URL,
  ].filter((u): u is string => Boolean(u && typeof u === 'string' && u.trim() !== ''));

  let resolvedUrl: string | null = null;
  let extractedToken: string | null = null;

  // 1. First look for an explicit https:// or http:// REST endpoint URL
  for (const candidate of candidateUrls) {
    const trimmed = candidate.trim();
    if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
      resolvedUrl = trimmed;
      break;
    }
  }

  // 2. If no https:// URL found, inspect rediss:// or redis:// URIs and parse hostname + password
  if (!resolvedUrl) {
    for (const candidate of candidateUrls) {
      const trimmed = candidate.trim();
      if (trimmed.startsWith('rediss://') || trimmed.startsWith('redis://')) {
        try {
          const parsed = new URL(trimmed);
          if (parsed.hostname) {
            resolvedUrl = `https://${parsed.hostname}`;
            if (parsed.password) {
              extractedToken = decodeURIComponent(parsed.password);
            }
            break;
          }
        } catch (e) {
          console.warn('[DB] Could not parse redis URI:', e);
        }
      }
    }
  }

  const token =
    process.env.KV_REST_API_TOKEN?.trim() ||
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim() ||
    process.env.UPSTASH_REDIS_TOKEN?.trim() ||
    extractedToken;

  if (resolvedUrl && token) {
    return { url: resolvedUrl, token };
  }

  return null;
}

/**
 * Returns an active Upstash Redis client configured from environment variables.
 */
function getRedisClient(): Redis | null {
  if (cachedRedisClient) {
    return cachedRedisClient;
  }

  const creds = normalizeRedisCredentials();
  if (creds) {
    try {
      cachedRedisClient = new Redis({ url: creds.url, token: creds.token });
      return cachedRedisClient;
    } catch (err) {
      if (!hasLoggedRedisError) {
        console.error('[DB] Failed to instantiate Upstash Redis client with credentials:', err);
        hasLoggedRedisError = true;
      }
      return null;
    }
  }

  // Attempt Redis.fromEnv() if environment variables match default patterns
  try {
    cachedRedisClient = Redis.fromEnv();
    return cachedRedisClient;
  } catch {
    return null;
  }
}

/**
 * Parse raw Redis data that can be:
 * - Native JS Array of Review objects
 * - Serialized JSON string of array
 * - Array containing serialized JSON string (from previous REST API versions)
 */
function parseReviewsData(raw: unknown): Review[] | null {
  if (!raw) return null;

  // Case 1: Serialized JSON string
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return parseReviewsData(parsed);
    } catch (e) {
      console.error('[DB] Error parsing reviews JSON string from Redis:', e);
      return null;
    }
  }

  // Case 2: Array
  if (Array.isArray(raw)) {
    if (raw.length === 0) {
      return [];
    }

    // Check if the array contains serialized JSON strings (legacy double-serialized format)
    if (typeof raw[0] === 'string') {
      try {
        const firstParsed = JSON.parse(raw[0]);
        if (Array.isArray(firstParsed)) {
          return parseReviewsData(firstParsed);
        }
      } catch {}

      const parsedElements: Review[] = [];
      for (const item of raw) {
        if (typeof item === 'string') {
          try {
            parsedElements.push(JSON.parse(item));
          } catch {}
        } else if (item && typeof item === 'object') {
          parsedElements.push(item as Review);
        }
      }
      if (parsedElements.length > 0) {
        return parsedElements;
      }
    }

    // Filter and return valid Review objects
    const validReviews = raw.filter(
      (r) => r && typeof r === 'object' && ('id' in r || 'text' in r || 'name' in r)
    );
    return validReviews as Review[];
  }

  return null;
}

/**
 * Fetch all reviews from Upstash Redis (source of truth).
 * Seeds with INITIAL_REVIEWS only if the key jmoon_reviews does not exist yet.
 */
export async function getReviews(adminView = false): Promise<Review[]> {
  const redis = getRedisClient();

  if (redis) {
    try {
      const rawData = await redis.get(REDIS_KEY);
      let reviews = parseReviewsData(rawData);

      // If key jmoon_reviews does not exist yet, seed it with INITIAL_REVIEWS
      if (reviews === null) {
        reviews = [...INITIAL_REVIEWS];
        try {
          await redis.set(REDIS_KEY, reviews);
        } catch (setErr) {
          console.error('[DB] Failed to seed initial reviews to Redis:', setErr);
        }
      }

      inMemoryReviews = reviews;

      if (adminView) {
        return [...reviews];
      }
      return reviews.filter((r) => r.published === true);
    } catch (err) {
      console.error('[DB] Error querying Upstash Redis:', err);
      // If Redis has transient failure, return in-memory cache if available or initial reviews
      if (inMemoryReviews !== null) {
        return adminView ? [...inMemoryReviews] : inMemoryReviews.filter((r) => r.published === true);
      }
      return adminView ? [...INITIAL_REVIEWS] : INITIAL_REVIEWS.filter((r) => r.published === true);
    }
  }

  // Fallback when Redis environment variables are not set (e.g. local offline dev)
  if (inMemoryReviews === null) {
    inMemoryReviews = [...INITIAL_REVIEWS];
  }

  if (adminView) {
    return [...inMemoryReviews];
  }
  return inMemoryReviews.filter((r) => r.published === true);
}

/**
 * Create a new review and persist it to Upstash Redis.
 */
export async function createReview(data: {
  name: string;
  service: ServiceType;
  rating: number;
  text: string;
  date?: string;
  published: boolean;
}): Promise<Review> {
  const reviews = await getReviews(true);

  const formattedDate =
    data.date && data.date.trim() !== ''
      ? data.date.trim()
      : new Intl.DateTimeFormat('pl-PL', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(new Date());

  const newReview: Review = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: data.name.trim(),
    author: data.name.trim(),
    service: data.service,
    rating: Math.min(5, Math.max(1, Math.round(data.rating))),
    text: data.text.trim(),
    date: formattedDate,
    published: Boolean(data.published),
  };

  reviews.unshift(newReview);
  inMemoryReviews = reviews;

  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(REDIS_KEY, reviews);
    } catch (err) {
      console.error('[DB] Failed to save created review to Upstash Redis:', err);
      throw new Error('Nie udało się zapisać opinii w bazie danych.');
    }
  }

  return newReview;
}

/**
 * Update an existing review by id and persist changes to Upstash Redis.
 */
export async function updateReview(
  id: string,
  data: Partial<Omit<Review, 'id'>>
): Promise<Review | null> {
  const reviews = await getReviews(true);
  const index = reviews.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const current = reviews[index];
  const updated: Review = {
    ...current,
    ...data,
    id: current.id,
    author: data.name ? data.name.trim() : current.name,
    name: data.name ? data.name.trim() : current.name,
  };

  reviews[index] = updated;
  inMemoryReviews = reviews;

  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(REDIS_KEY, reviews);
    } catch (err) {
      console.error('[DB] Failed to update review in Upstash Redis:', err);
      throw new Error('Nie udało się zaktualizować opinii w bazie danych.');
    }
  }

  return updated;
}

/**
 * Delete a review by id and persist change to Upstash Redis.
 */
export async function deleteReview(id: string): Promise<boolean> {
  const reviews = await getReviews(true);
  const filtered = reviews.filter((r) => r.id !== id);
  if (filtered.length === reviews.length) {
    return false;
  }

  inMemoryReviews = filtered;

  const redis = getRedisClient();
  if (redis) {
    try {
      await redis.set(REDIS_KEY, filtered);
    } catch (err) {
      console.error('[DB] Failed to delete review from Upstash Redis:', err);
      throw new Error('Nie udało się usunąć opinii z bazy danych.');
    }
  }

  return true;
}

/**
 * Calculate aggregated review stats for admin dashboard.
 */
export async function getReviewStats(): Promise<ReviewStats> {
  const reviews = await getReviews(true);
  const publishedReviews = reviews.filter((r) => r.published);

  const totalRating = publishedReviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating =
    publishedReviews.length > 0 ? Number((totalRating / publishedReviews.length).toFixed(1)) : 5.0;

  return {
    total: reviews.length,
    published: publishedReviews.length,
    hidden: reviews.length - publishedReviews.length,
    averageRating,
    byService: {
      kodyCiala: reviews.filter((r) => r.service === 'KODY CIAŁA').length,
      indywidualnaPrognoza: reviews.filter((r) => r.service === 'Indywidualna prognoza miesiąca').length,
      ekspresowaAnaliza: reviews.filter((r) => r.service === 'EKSPRESOWA ANALIZA MATRYCY LOSU').length,
    },
  };
}
