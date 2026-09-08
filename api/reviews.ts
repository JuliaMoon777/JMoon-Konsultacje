import type { IncomingMessage, ServerResponse } from 'http';
import { verifyAdminToken } from '../server/auth';
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  ALLOWED_SERVICES,
  ServiceType,
} from '../server/db';

interface VercelRequest extends IncomingMessage {
  body?: any;
  query?: Record<string, string | string[]>;
}

interface VercelResponse extends ServerResponse {
  status?: (code: number) => VercelResponse;
  json?: (data: any) => void;
}

/**
 * Universal JSON response helper for Vercel Serverless Functions
 */
function sendResponse(res: VercelResponse, statusCode: number, data: any) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

/**
 * Robust request body parser handling already-parsed objects, JSON strings, and streams
 */
async function parseBody(req: VercelRequest): Promise<any> {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    return req.body;
  }

  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
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
    req.on('error', () => {
      resolve({});
    });
  });
}

/**
 * Extract query parameters and id from query, body, or URL path
 */
function extractId(req: VercelRequest, body: any): string | undefined {
  if (req.query && req.query.id) {
    return Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  }
  if (body && body.id && typeof body.id === 'string') {
    return body.id;
  }
  if (req.url) {
    const cleanUrl = req.url.split('?')[0];
    const match = cleanUrl.match(/\/api\/reviews\/([^/]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  }
  return undefined;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = (req.method || 'GET').toUpperCase();
  const authHeader = req.headers['authorization'];
  const isAdmin = verifyAdminToken(authHeader);

  // 1. GET /api/reviews
  if (method === 'GET') {
    try {
      const reviews = await getReviews(isAdmin);
      return sendResponse(res, 200, {
        success: true,
        reviews,
        isAdmin,
      });
    } catch (err) {
      console.error('[API] Error fetching reviews:', err);
      return sendResponse(res, 500, {
        success: false,
        error: 'Błąd podczas pobierania opinii.',
        reviews: [],
        isAdmin: false,
      });
    }
  }

  // All mutating actions require Admin authorization
  if (!isAdmin) {
    return sendResponse(res, 401, {
      success: false,
      error: 'Brak uprawnień. Zaloguj się jako administrator.',
    });
  }

  const body = await parseBody(req);

  // 2. POST /api/reviews (Create Review)
  if (method === 'POST') {
    const { name, service, rating, text, date, published } = body || {};

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return sendResponse(res, 400, {
        success: false,
        error: 'Pole Imię jest wymagane.',
      });
    }

    if (!ALLOWED_SERVICES.includes(service as ServiceType)) {
      return sendResponse(res, 400, {
        success: false,
        error: `Pole Usługa musi być jednym z: ${ALLOWED_SERVICES.join(', ')}`,
      });
    }

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return sendResponse(res, 400, {
        success: false,
        error: 'Treść opinii jest wymagana.',
      });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return sendResponse(res, 400, {
        success: false,
        error: 'Ocena musi wynosić od 1 do 5.',
      });
    }

    try {
      const created = await createReview({
        name: name.trim(),
        service: service as ServiceType,
        rating: numRating,
        text: text.trim(),
        date: typeof date === 'string' ? date.trim() : undefined,
        published: published === true || published === 'true',
      });

      return sendResponse(res, 201, {
        success: true,
        review: created,
        message: 'Opinia została pomyślnie dodana.',
      });
    } catch (err) {
      console.error('[API] Error creating review:', err);
      return sendResponse(res, 500, {
        success: false,
        error: 'Wystąpił błąd podczas dodawania opinii.',
      });
    }
  }

  // 3. PUT /api/reviews or /api/reviews/:id (Update Review)
  if (method === 'PUT') {
    const id = extractId(req, body);
    if (!id) {
      return sendResponse(res, 400, {
        success: false,
        error: 'ID opinii jest wymagane.',
      });
    }

    const { name, service, rating, text, date, published } = body || {};

    if (service && !ALLOWED_SERVICES.includes(service as ServiceType)) {
      return sendResponse(res, 400, {
        success: false,
        error: `Pole Usługa musi być jednym z: ${ALLOWED_SERVICES.join(', ')}`,
      });
    }

    try {
      const updateData: Partial<Omit<import('../server/db').Review, 'id'>> = {};
      if (typeof name === 'string' && name.trim() !== '') updateData.name = name.trim();
      if (service) updateData.service = service;
      if (rating !== undefined) updateData.rating = Math.min(5, Math.max(1, Number(rating)));
      if (typeof text === 'string' && text.trim() !== '') updateData.text = text.trim();
      if (typeof date === 'string') updateData.date = date.trim();
      if (published !== undefined) updateData.published = Boolean(published);

      const updated = await updateReview(id, updateData);
      if (!updated) {
        return sendResponse(res, 404, {
          success: false,
          error: 'Nie znaleziono opinii o podanym ID.',
        });
      }

      return sendResponse(res, 200, {
        success: true,
        review: updated,
        message: 'Opinia została zaktualizowana.',
      });
    } catch (err) {
      console.error('[API] Error updating review:', err);
      return sendResponse(res, 500, {
        success: false,
        error: 'Wystąpił błąd podczas aktualizacji opinii.',
      });
    }
  }

  // 4. DELETE /api/reviews or /api/reviews/:id (Delete Review)
  if (method === 'DELETE') {
    const id = extractId(req, body);
    if (!id) {
      return sendResponse(res, 400, {
        success: false,
        error: 'ID opinii jest wymagane.',
      });
    }

    try {
      const deleted = await deleteReview(id);
      if (!deleted) {
        return sendResponse(res, 404, {
          success: false,
          error: 'Nie znaleziono opinii o podanym ID.',
        });
      }

      return sendResponse(res, 200, {
        success: true,
        message: 'Opinia została pomyślnie usunięta.',
      });
    } catch (err) {
      console.error('[API] Error deleting review:', err);
      return sendResponse(res, 500, {
        success: false,
        error: 'Wystąpił błąd podczas usuwania opinii.',
      });
    }
  }

  return sendResponse(res, 405, { error: 'Metoda niedozwolona.' });
}
