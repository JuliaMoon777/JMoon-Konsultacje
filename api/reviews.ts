import type { IncomingMessage, ServerResponse } from 'http';

import { verifyAdminToken } from '../server/auth';

import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  ALLOWED_SERVICES,
} from '../server/db';

import type {
  Review,
  ServiceType,
} from '../server/db';

interface VercelRequest extends IncomingMessage {
  body?: any;
  query?: Record<string, string | string[] | undefined>;
}

interface VercelResponse extends ServerResponse {
  status?: (code: number) => VercelResponse;
  json?: (data: any) => void;
}

/**
 * Universal JSON response helper.
 * Works with Vercel/Next-style res.status().json()
 * and standard Node ServerResponse.
 */
function sendResponse(
  res: VercelResponse,
  statusCode: number,
  data: any,
) {
  if (
    typeof res.status === 'function' &&
    typeof res.json === 'function'
  ) {
    return res.status(statusCode).json(data);
  }

  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

/**
 * Parse request body.
 * Supports:
 * - already parsed object
 * - JSON string
 * - raw Node request stream
 */
async function parseBody(req: VercelRequest): Promise<any> {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      if (req.body.trim() === '') {
        return {};
      }

      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }

    if (typeof req.body === 'object') {
      return req.body;
    }

    return {};
  }

  return new Promise((resolve) => {
    let raw = '';

    req.on('data', (chunk) => {
      raw += chunk.toString();
    });

    req.on('end', () => {
      if (!raw || raw.trim() === '') {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });

    req.on('error', (error) => {
      console.error('[REVIEWS API] Request body error:', error);
      resolve({});
    });
  });
}

/**
 * Normalize Authorization header.
 */
function getAuthorizationHeader(
  req: VercelRequest,
): string | undefined {
  const header = req.headers.authorization;

  if (Array.isArray(header)) {
    return header[0];
  }

  return header;
}

/**
 * Extract review ID from:
 *
 * /api/reviews?id=123
 *
 * body:
 * { id: "123" }
 *
 * or:
 * /api/reviews/123
 */
function extractId(
  req: VercelRequest,
  body: any,
): string | undefined {
  const queryId = req.query?.id;

  if (queryId) {
    if (Array.isArray(queryId)) {
      return queryId[0];
    }

    return queryId;
  }

  if (
    body &&
    typeof body.id === 'string' &&
    body.id.trim() !== ''
  ) {
    return body.id.trim();
  }

  if (req.url) {
    const cleanUrl = req.url.split('?')[0];

    const match = cleanUrl.match(
      /\/api\/reviews\/([^/]+)\/?$/,
    );

    if (match?.[1]) {
      try {
        return decodeURIComponent(match[1]);
      } catch {
        return match[1];
      }
    }
  }

  return undefined;
}

/**
 * Convert different frontend representations to boolean.
 *
 * true      -> true
 * false     -> false
 * "true"    -> true
 * "false"   -> false
 * 1         -> true
 * 0         -> false
 */
function parseBoolean(
  value: unknown,
  defaultValue = false,
): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (normalized === 'true' || normalized === '1') {
      return true;
    }

    if (normalized === 'false' || normalized === '0') {
      return false;
    }
  }

  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  return defaultValue;
}

/**
 * Validate rating.
 */
function parseRating(value: unknown): number | null {
  const rating = Number(value);

  if (!Number.isFinite(rating)) {
    return null;
  }

  if (rating < 1 || rating > 5) {
    return null;
  }

  return rating;
}

/**
 * Check allowed service.
 */
function isAllowedService(
  value: unknown,
): value is ServiceType {
  return (
    typeof value === 'string' &&
    ALLOWED_SERVICES.includes(value as ServiceType)
  );
}

/**
 * Main Reviews API handler.
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  console.log('[REVIEWS API] Handler started', {
    method: req.method,
    url: req.url,
  });

  /**
   * IMPORTANT:
   * Only boolean presence is logged.
   * Secret values are NEVER logged.
   */
  console.log('[REVIEWS API] Environment check', {
    hasKvRestApiUrl: Boolean(
      process.env.KV_REST_API_URL,
    ),
    hasKvRestApiToken: Boolean(
      process.env.KV_REST_API_TOKEN,
    ),
    hasUpstashRedisRestUrl: Boolean(
      process.env.UPSTASH_REDIS_REST_URL,
    ),
    hasUpstashRedisRestToken: Boolean(
      process.env.UPSTASH_REDIS_REST_TOKEN,
    ),
    hasAdminReviewPassword: Boolean(
      process.env.ADMIN_REVIEW_PASSWORD,
    ),
  });

  try {
    const method = (req.method || 'GET').toUpperCase();

    /*
     * Authorization should never be allowed
     * to crash the whole Serverless Function.
     */
    let isAdmin = false;

    try {
      const authHeader = getAuthorizationHeader(req);
      isAdmin = verifyAdminToken(authHeader);
    } catch (error) {
      console.error(
        '[REVIEWS API] Admin authentication error:',
        error,
      );

      isAdmin = false;
    }

    console.log('[REVIEWS API] Request', {
      method,
      isAdmin,
    });

    /*
     * ======================================================
     * GET /api/reviews
     * ======================================================
     */
    if (method === 'GET') {
      try {
        console.log(
          '[REVIEWS API] Calling getReviews()...',
        );

        const reviews = await getReviews(isAdmin);

        console.log(
          '[REVIEWS API] getReviews() successful',
          {
            count: Array.isArray(reviews)
              ? reviews.length
              : 0,
            isAdmin,
          },
        );

        return sendResponse(res, 200, {
          success: true,
          reviews: Array.isArray(reviews)
            ? reviews
            : [],
          isAdmin,
        });
      } catch (error) {
        console.error(
          '[REVIEWS API] Error fetching reviews:',
          error,
        );

        return sendResponse(res, 500, {
          success: false,
          error:
            'Błąd podczas pobierania opinii.',
          reviews: [],
          isAdmin: false,
        });
      }
    }

    /*
     * ======================================================
     * Only administrator can modify reviews
     * ======================================================
     */
    if (
      method === 'POST' ||
      method === 'PUT' ||
      method === 'DELETE'
    ) {
      if (!isAdmin) {
        return sendResponse(res, 401, {
          success: false,
          error:
            'Brak uprawnień. Zaloguj się jako administrator.',
        });
      }
    }

    /*
     * Parse body only when required.
     */
    const body =
      method === 'POST' ||
      method === 'PUT' ||
      method === 'DELETE'
        ? await parseBody(req)
        : {};

    /*
     * ======================================================
     * POST /api/reviews
     * Create review
     * ======================================================
     */
    if (method === 'POST') {
      const {
        name,
        service,
        rating,
        text,
        date,
        published,
      } = body || {};

      if (
        typeof name !== 'string' ||
        name.trim() === ''
      ) {
        return sendResponse(res, 400, {
          success: false,
          error: 'Pole Imię jest wymagane.',
        });
      }

      if (!isAllowedService(service)) {
        return sendResponse(res, 400, {
          success: false,
          error:
            `Pole Usługa musi być jednym z: ${ALLOWED_SERVICES.join(
              ', ',
            )}`,
        });
      }

      if (
        typeof text !== 'string' ||
        text.trim() === ''
      ) {
        return sendResponse(res, 400, {
          success: false,
          error:
            'Treść opinii jest wymagana.',
        });
      }

      const parsedRating = parseRating(rating);

      if (parsedRating === null) {
        return sendResponse(res, 400, {
          success: false,
          error:
            'Ocena musi wynosić od 1 do 5.',
        });
      }

      try {
        console.log(
          '[REVIEWS API] Creating review...',
        );

        const created = await createReview({
          name: name.trim(),
          service,
          rating: parsedRating,
          text: text.trim(),

          date:
            typeof date === 'string' &&
            date.trim() !== ''
              ? date.trim()
              : undefined,

          published: parseBoolean(
            published,
            false,
          ),
        });

        console.log(
          '[REVIEWS API] Review created',
          {
            id: created?.id,
          },
        );

        return sendResponse(res, 201, {
          success: true,
          review: created,
          message:
            'Opinia została pomyślnie dodana.',
        });
      } catch (error) {
        console.error(
          '[REVIEWS API] Error creating review:',
          error,
        );

        return sendResponse(res, 500, {
          success: false,
          error:
            'Wystąpił błąd podczas dodawania opinii.',
        });
      }
    }

    /*
     * ======================================================
     * PUT /api/reviews
     * PUT /api/reviews/:id
     *
     * Update review
     * ======================================================
     */
    if (method === 'PUT') {
      const id = extractId(req, body);

      if (!id) {
        return sendResponse(res, 400, {
          success: false,
          error:
            'ID opinii jest wymagane.',
        });
      }

      const {
        name,
        service,
        rating,
        text,
        date,
        published,
      } = body || {};

      const updateData: Partial<
        Omit<Review, 'id'>
      > = {};

      /*
       * Name
       */
      if (name !== undefined) {
        if (
          typeof name !== 'string' ||
          name.trim() === ''
        ) {
          return sendResponse(res, 400, {
            success: false,
            error:
              'Pole Imię nie może być puste.',
          });
        }

        updateData.name = name.trim();
      }

      /*
       * Service
       */
      if (service !== undefined) {
        if (!isAllowedService(service)) {
          return sendResponse(res, 400, {
            success: false,
            error:
              `Pole Usługa musi być jednym z: ${ALLOWED_SERVICES.join(
                ', ',
              )}`,
          });
        }

        updateData.service = service;
      }

      /*
       * Rating
       */
      if (rating !== undefined) {
        const parsedRating =
          parseRating(rating);

        if (parsedRating === null) {
          return sendResponse(res, 400, {
            success: false,
            error:
              'Ocena musi wynosić od 1 do 5.',
          });
        }

        updateData.rating =
          parsedRating;
      }

      /*
       * Text
       */
      if (text !== undefined) {
        if (
          typeof text !== 'string' ||
          text.trim() === ''
        ) {
          return sendResponse(res, 400, {
            success: false,
            error:
              'Treść opinii nie może być pusta.',
          });
        }

        updateData.text = text.trim();
      }

      /*
       * Date
       */
      if (date !== undefined) {
        if (typeof date !== 'string') {
          return sendResponse(res, 400, {
            success: false,
            error:
              'Nieprawidłowa wartość pola daty.',
          });
        }

        updateData.date = date.trim();
      }

      /*
       * Published
       */
      if (published !== undefined) {
        updateData.published =
          parseBoolean(
            published,
            false,
          );
      }

      if (
        Object.keys(updateData).length === 0
      ) {
        return sendResponse(res, 400, {
          success: false,
          error:
            'Brak danych do aktualizacji.',
        });
      }

      try {
        console.log(
          '[REVIEWS API] Updating review',
          {
            id,
          },
        );

        const updated = await updateReview(
          id,
          updateData,
        );

        if (!updated) {
          return sendResponse(res, 404, {
            success: false,
            error:
              'Nie znaleziono opinii o podanym ID.',
          });
        }

        console.log(
          '[REVIEWS API] Review updated',
          {
            id,
          },
        );

        return sendResponse(res, 200, {
          success: true,
          review: updated,
          message:
            'Opinia została zaktualizowana.',
        });
      } catch (error) {
        console.error(
          '[REVIEWS API] Error updating review:',
          error,
        );

        return sendResponse(res, 500, {
          success: false,
          error:
            'Wystąpił błąd podczas aktualizacji opinii.',
        });
      }
    }

    /*
     * ======================================================
     * DELETE /api/reviews
     * DELETE /api/reviews/:id
     *
     * Delete review
     * ======================================================
     */
    if (method === 'DELETE') {
      const id = extractId(req, body);

      if (!id) {
        return sendResponse(res, 400, {
          success: false,
          error:
            'ID opinii jest wymagane.',
        });
      }

      try {
        console.log(
          '[REVIEWS API] Deleting review',
          {
            id,
          },
        );

        const deleted =
          await deleteReview(id);

        if (!deleted) {
          return sendResponse(res, 404, {
            success: false,
            error:
              'Nie znaleziono opinii o podanym ID.',
          });
        }

        console.log(
          '[REVIEWS API] Review deleted',
          {
            id,
          },
        );

        return sendResponse(res, 200, {
          success: true,
          message:
            'Opinia została pomyślnie usunięta.',
        });
      } catch (error) {
        console.error(
          '[REVIEWS API] Error deleting review:',
          error,
        );

        return sendResponse(res, 500, {
          success: false,
          error:
            'Wystąpił błąd podczas usuwania opinii.',
        });
      }
    }

    /*
     * ======================================================
     * Unsupported HTTP method
     * ======================================================
     */
    res.setHeader(
      'Allow',
      'GET, POST, PUT, DELETE',
    );

    return sendResponse(res, 405, {
      success: false,
      error: 'Metoda niedozwolona.',
    });
  } catch (error) {
    /*
     * Last-resort protection.
     *
     * An unexpected runtime exception should
     * return JSON instead of killing the function.
     */
    console.error(
      '[REVIEWS API] FATAL HANDLER ERROR:',
      error,
    );

    return sendResponse(res, 500, {
      success: false,
      error:
        'Wewnętrzny błąd serwera.',
      reviews: [],
    });
  }
}
