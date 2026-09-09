import type { IncomingMessage, ServerResponse } from 'http';
import { verifyAdminToken } from '../../server/auth.js';
import { getReviewStats } from '../../server/db.js';

interface VercelRequest extends IncomingMessage {}

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const authHeader = req.headers['authorization'];
  if (!verifyAdminToken(authHeader)) {
    return sendResponse(res, 401, {
      success: false,
      error: 'Brak uprawnień. Zaloguj się jako administrator.',
    });
  }

  try {
    const stats = await getReviewStats();
    return sendResponse(res, 200, { success: true, stats });
  } catch (err) {
    console.error('[API] Error fetching stats:', err);
    return sendResponse(res, 500, {
      success: false,
      error: 'Wystąpił błąd podczas pobierania statystyk.',
    });
  }
}
