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
  body: any;
  query: Record<string, string | string[]>;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;
  const authHeader = req.headers.authorization;
  const isAdmin = verifyAdminToken(authHeader);

  // GET /api/reviews
  if (method === 'GET') {
    try {
      const reviews = await getReviews(isAdmin);
      return res.status(200).json({ success: true, reviews, isAdmin });
    } catch (err) {
      console.error('[API] Error fetching reviews:', err);
      return res.status(500).json({ success: false, error: 'Błąd podczas pobierania opinii.' });
    }
  }

  // All mutating methods require admin authentication
  if (!isAdmin) {
    return res.status(401).json({ success: false, error: 'Brak uprawnień.' });
  }

  // POST /api/reviews (create)
  if (method === 'POST') {
    const { name, service, rating, text, date, published } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Pole Imię jest wymagane.' });
    }

    if (!ALLOWED_SERVICES.includes(service as ServiceType)) {
      return res.status(400).json({
        success: false,
        error: `Pole Usługa musi być jednym z: ${ALLOWED_SERVICES.join(', ')}`,
      });
    }

    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ success: false, error: 'Treść opinii jest wymagana.' });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, error: 'Ocena musi wynosić od 1 do 5.' });
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

      return res.status(201).json({
        success: true,
        review: created,
        message: 'Opinia została dodana.',
      });
    } catch (err) {
      console.error('[API] Error creating review:', err);
      return res.status(500).json({ success: false, error: 'Błąd podczas dodawania opinii.' });
    }
  }

  // PUT /api/reviews (update)
  if (method === 'PUT') {
    const id = (req.query.id as string) || req.body?.id;
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID opinii jest wymagane.' });
    }

    const { name, service, rating, text, date, published } = req.body || {};

    if (service && !ALLOWED_SERVICES.includes(service as ServiceType)) {
      return res.status(400).json({
        success: false,
        error: `Pole Usługa musi być jednym z: ${ALLOWED_SERVICES.join(', ')}`,
      });
    }

    try {
      const updateData: any = {};
      if (typeof name === 'string') updateData.name = name.trim();
      if (service) updateData.service = service;
      if (rating !== undefined) updateData.rating = Math.min(5, Math.max(1, Number(rating)));
      if (typeof text === 'string') updateData.text = text.trim();
      if (typeof date === 'string') updateData.date = date.trim();
      if (published !== undefined) updateData.published = Boolean(published);

      const updated = await updateReview(id, updateData);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Nie znaleziono opinii.' });
      }

      return res.status(200).json({ success: true, review: updated, message: 'Opinia została zaktualizowana.' });
    } catch (err) {
      console.error('[API] Error updating review:', err);
      return res.status(500).json({ success: false, error: 'Błąd podczas aktualizacji opinii.' });
    }
  }

  // DELETE /api/reviews
  if (method === 'DELETE') {
    const id = (req.query.id as string) || req.body?.id;
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID opinii jest wymagane.' });
    }

    try {
      const deleted = await deleteReview(id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Nie znaleziono opinii.' });
      }

      return res.status(200).json({ success: true, message: 'Opinia została usunięta.' });
    } catch (err) {
      console.error('[API] Error deleting review:', err);
      return res.status(500).json({ success: false, error: 'Błąd podczas usuwania opinii.' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
