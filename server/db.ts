import { Redis } from '@upstash/redis';

export type ServiceType =
  | 'KODY CIAŁA'
  | 'Indywidualna prognoza miesiąca'
  | 'EKSPRESOWA ANALIZA MATRYCY LOSU';

export interface Review {
  id: string;
  name: string;
  author?: string;
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
let cachedRedisClient: Redis | null = null;

/**
 * Vercel's Upstash integration exposes KV_REST_API_* variables.
 * Direct Upstash integrations usually expose UPSTASH_REDIS_REST_* variables.
 * Both point to the same REST client model supported by @upstash/redis.
 */
function getRedisClient(): Redis {
  if (cachedRedisClient) {
    return cachedRedisClient;
  }

  const url =
    process.env.KV_REST_API_URL?.trim() ||
    process.env.UPSTASH_REDIS_REST_URL?.trim();

  const token =
    process.env.KV_REST_API_TOKEN?.trim() ||
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (!url || !token) {
    throw new Error(
      'Redis is not configured. Expected KV_REST_API_URL/KV_REST_API_TOKEN or UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN.'
    );
  }

  cachedRedisClient = new Redis({ url, token });
  return cachedRedisClient;
}

function isAllowedService(value: unknown): value is ServiceType {
  return (
    typeof value === 'string' &&
    ALLOWED_SERVICES.includes(value as ServiceType)
  );
}

function normalizeReview(value: unknown): Review | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<Review> & { author?: unknown };
  const name =
    typeof candidate.name === 'string' && candidate.name.trim()
      ? candidate.name.trim()
      : typeof candidate.author === 'string' && candidate.author.trim()
        ? candidate.author.trim()
        : '';

  const rating = Number(candidate.rating);

  if (
    typeof candidate.id !== 'string' ||
    !candidate.id.trim() ||
    !name ||
    !isAllowedService(candidate.service) ||
    !Number.isFinite(rating) ||
    rating < 1 ||
    rating > 5 ||
    typeof candidate.text !== 'string' ||
    !candidate.text.trim() ||
    typeof candidate.date !== 'string' ||
    typeof candidate.published !== 'boolean'
  ) {
    return null;
  }

  return {
    id: candidate.id.trim(),
    name,
    author: name,
    service: candidate.service,
    rating,
    text: candidate.text.trim(),
    date: candidate.date.trim(),
    published: candidate.published,
  };
}

/**
 * Supports the current @upstash/redis representation plus legacy JSON strings
 * that may already exist under jmoon_reviews.
 */
function parseReviewsData(raw: unknown): Review[] | null {
  if (raw === null || raw === undefined) {
    return null;
  }

  if (typeof raw === 'string') {
    try {
      return parseReviewsData(JSON.parse(raw));
    } catch {
      throw new Error('Invalid JSON stored in Redis key jmoon_reviews.');
    }
  }

  if (!Array.isArray(raw)) {
    throw new Error('Redis key jmoon_reviews does not contain a review array.');
  }

  if (raw.length === 0) {
    return [];
  }

  // Legacy format: an array containing a JSON-serialized array.
  if (raw.length === 1 && typeof raw[0] === 'string') {
    try {
      const parsed = JSON.parse(raw[0]);
      if (Array.isArray(parsed)) {
        return parseReviewsData(parsed);
      }
    } catch {
      // Continue with per-item legacy parsing below.
    }
  }

  const reviews: Review[] = [];

  for (const item of raw) {
    let candidate: unknown = item;

    if (typeof item === 'string') {
      try {
        candidate = JSON.parse(item);
      } catch {
        throw new Error('Invalid serialized review stored in Redis.');
      }
    }

    const normalized = normalizeReview(candidate);
    if (!normalized) {
      throw new Error('Invalid review object stored in Redis.');
    }

    reviews.push(normalized);
  }

  return reviews;
}

async function loadAllReviews(): Promise<Review[]> {
  const redis = getRedisClient();
  const rawData = await redis.get<unknown>(REDIS_KEY);

  // Seed only when the key does not exist. Never overwrite existing data.
  if (rawData === null || rawData === undefined) {
    const initial = INITIAL_REVIEWS.map((review) => ({ ...review }));
    await redis.set(REDIS_KEY, initial);
    return initial;
  }

  const reviews = parseReviewsData(rawData);
  if (reviews === null) {
    throw new Error('Could not load reviews from Redis.');
  }

  return reviews;
}

async function saveAllReviews(reviews: Review[]): Promise<void> {
  const redis = getRedisClient();
  await redis.set(REDIS_KEY, reviews);
}

/**
 * Redis is the source of truth. Public callers receive only published reviews;
 * administrators receive the complete list.
 */
export async function getReviews(adminView = false): Promise<Review[]> {
  const reviews = await loadAllReviews();
  return adminView
    ? reviews.map((review) => ({ ...review }))
    : reviews.filter((review) => review.published).map((review) => ({ ...review }));
}

export async function createReview(data: {
  name: string;
  service: ServiceType;
  rating: number;
  text: string;
  date?: string;
  published: boolean;
}): Promise<Review> {
  const reviews = await loadAllReviews();

  const formattedDate =
    data.date && data.date.trim()
      ? data.date.trim()
      : new Intl.DateTimeFormat('pl-PL', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'Europe/Warsaw',
        }).format(new Date());

  const name = data.name.trim();

  const newReview: Review = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name,
    author: name,
    service: data.service,
    rating: Math.min(5, Math.max(1, Math.round(data.rating))),
    text: data.text.trim(),
    date: formattedDate,
    published: data.published === true,
  };

  const nextReviews = [newReview, ...reviews];
  await saveAllReviews(nextReviews);

  return { ...newReview };
}

export async function updateReview(
  id: string,
  data: Partial<Omit<Review, 'id'>>
): Promise<Review | null> {
  const reviews = await loadAllReviews();
  const index = reviews.findIndex((review) => review.id === id);

  if (index === -1) {
    return null;
  }

  const current = reviews[index];
  const nextName =
    typeof data.name === 'string' && data.name.trim()
      ? data.name.trim()
      : current.name;

  const updated: Review = {
    ...current,
    ...data,
    id: current.id,
    name: nextName,
    author: nextName,
  };

  reviews[index] = updated;
  await saveAllReviews(reviews);

  return { ...updated };
}

export async function deleteReview(id: string): Promise<boolean> {
  const reviews = await loadAllReviews();
  const nextReviews = reviews.filter((review) => review.id !== id);

  if (nextReviews.length === reviews.length) {
    return false;
  }

  await saveAllReviews(nextReviews);
  return true;
}

export async function getReviewStats(): Promise<ReviewStats> {
  const reviews = await loadAllReviews();
  const publishedReviews = reviews.filter((review) => review.published);

  const totalRating = publishedReviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );

  const averageRating =
    publishedReviews.length > 0
      ? Number((totalRating / publishedReviews.length).toFixed(1))
      : 5.0;

  return {
    total: reviews.length,
    published: publishedReviews.length,
    hidden: reviews.length - publishedReviews.length,
    averageRating,
    byService: {
      kodyCiala: reviews.filter((review) => review.service === 'KODY CIAŁA').length,
      indywidualnaPrognoza: reviews.filter(
        (review) => review.service === 'Indywidualna prognoza miesiąca'
      ).length,
      ekspresowaAnaliza: reviews.filter(
        (review) => review.service === 'EKSPRESOWA ANALIZA MATRYCY LOSU'
      ).length,
    },
  };
}
