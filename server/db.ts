import fs from 'fs';
import path from 'path';

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

const INITIAL_REVIEWS: Review[] = [
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

// Persistent file path for server environments where external KV is not configured
const STORAGE_FILE = path.join(process.cwd(), '.data-reviews.json');

// Memory cache
let inMemoryReviews: Review[] | null = null;

// External DB config (Upstash Redis / Vercel KV REST)
const KV_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

async function loadFromExternalKV(): Promise<Review[] | null> {
  if (!KV_URL || !KV_TOKEN) return null;
  try {
    const res = await fetch(`${KV_URL}/get/jmoon_reviews`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data.result) {
      const parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
      if (Array.isArray(parsed)) return parsed;
    }
    return null;
  } catch (err) {
    console.warn('[DB] Failed to load from external KV, falling back to local storage:', err);
    return null;
  }
}

async function saveToExternalKV(reviews: Review[]): Promise<boolean> {
  if (!KV_URL || !KV_TOKEN) return false;
  try {
    const res = await fetch(`${KV_URL}/set/jmoon_reviews`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${KV_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([JSON.stringify(reviews)]),
    });
    return res.ok;
  } catch (err) {
    console.warn('[DB] Failed to save to external KV:', err);
    return false;
  }
}

function loadFromLocalFile(): Review[] {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[DB] Could not read local file:', e);
  }
  return [...INITIAL_REVIEWS];
}

function saveToLocalFile(reviews: Review[]): void {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(reviews, null, 2), 'utf8');
  } catch (e) {
    console.warn('[DB] Could not write local file:', e);
  }
}

export async function getReviews(adminView = false): Promise<Review[]> {
  if (inMemoryReviews === null) {
    const fromKV = await loadFromExternalKV();
    if (fromKV && fromKV.length > 0) {
      inMemoryReviews = fromKV;
    } else {
      inMemoryReviews = loadFromLocalFile();
    }
  }

  if (adminView) {
    return [...inMemoryReviews];
  }

  return inMemoryReviews.filter((r) => r.published === true);
}

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

  // Persist
  saveToLocalFile(reviews);
  await saveToExternalKV(reviews);

  return newReview;
}

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

  saveToLocalFile(reviews);
  await saveToExternalKV(reviews);

  return updated;
}

export async function deleteReview(id: string): Promise<boolean> {
  const reviews = await getReviews(true);
  const filtered = reviews.filter((r) => r.id !== id);
  if (filtered.length === reviews.length) {
    return false;
  }

  inMemoryReviews = filtered;
  saveToLocalFile(filtered);
  await saveToExternalKV(filtered);

  return true;
}

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
