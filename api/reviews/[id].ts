import type { IncomingMessage, ServerResponse } from 'http';
import { verifyAdminToken } from '../../server/auth.js';
import { updateReview, deleteReview, ALLOWED_SERVICES } from '../../server/db.js';
import type { ServiceType } from '../../server/db.js';

interface VercelRequest extends IncomingMessage {
  body?: any;
  query?: Record<string, string | string[]>;
}

interface VercelResponse extends ServerResponse {
  status?: (code: number) => VercelResponse;
  json?: (data: any) => void;
}

function sendResponse(res: VercelResponse, statusCode: number, data: any) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

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

  if (method === 'OPTIONS') {
    return sendResponse(res, 200, { ok: true });
  }

  const authHeader = req.headers['authorization'];
  const isAdmin = verifyAdminToken(authHeader);

  if (!isAdmin) {
    return sendResponse(res, 401, {
      success: false,
      error: 'Brak uprawnień. Zaloguj się jako administrator.',
    });
  }

  const body = await parseBody(req);
  const id = extractId(req, body);

  if (!id) {
    return sendResponse(res, 400, {
      success: false,
      error: 'Brak identyfikatora opinii (id).',
    });
  }

  // PUT /api/reviews/[id]
  if (method === 'PUT') {
    try {
      const updateData: any = {};
      if (body.name !== undefined) updateData.name = String(body.name).trim();
      if (body.service !== undefined) {
        if (!ALLOWED_SERVICES.includes(body.service)) {
          return sendResponse(res, 400, {
            success: false,
            error: 'Nieprawidłowa nazwa usługi.',
          });
        }
        updateData.service = body.service as ServiceType;
      }
      if (body.rating !== undefined) {
        const parsedRating = Number(body.rating);
        if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
          return sendResponse(res, 400, {
            success: false,
            error: 'Ocena musi wynosić od 1 do 5.',
          });
        }
        updateData.rating = parsedRating;
      }
      if (body.text !== undefined) updateData.text = String(body.text).trim();
      if (body.date !== undefined) updateData.date = String(body.date).trim();
      if (body.published !== undefined) {
        updateData.published =
          body.published === true || body.published === 'true' || body.published === 1 || body.published === '1';
      }

      const updated = await updateReview(id, updateData);
      if (!updated) {
        return sendResponse(res, 404, {
          success: false,
          error: 'Opinia o podanym ID nie istnieje.',
        });
      }

      return sendResponse(res, 200, {
        success: true,
        review: updated,
      });
    } catch (err) {
      console.error('[API] Error updating review:', err);
      return sendResponse(res, 500, {
        success: false,
        error: 'Nie udało się zaktualizować opinii.',
      });
    }
  }

  // DELETE /api/reviews/[id]
  if (method === 'DELETE') {
    try {
      const deleted = await deleteReview(id);
      if (!deleted) {
        return sendResponse(res, 404, {
          success: false,
          error: 'Opinia o podanym ID nie została znaleziona.',
        });
      }

      return sendResponse(res, 200, {
        success: true,
        message: 'Opinia została usunięta.',
      });
    } catch (err) {
      console.error('[API] Error deleting review:', err);
      return sendResponse(res, 500, {
        success: false,
        error: 'Nie udało się usunąć opinii.',
      });
    }
  }

  return sendResponse(res, 405, { error: 'Metoda niedozwolona.' });
}
