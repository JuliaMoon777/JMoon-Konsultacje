import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { verifyPassword, generateAdminToken, verifyAdminToken } from './server/auth';
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  getReviewStats,
  ALLOWED_SERVICES,
  ServiceType,
} from './server/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body parsing
  app.use(express.json());

  // ==========================================
  // AUTHENTICATION API
  // ==========================================

  // Verify access code / admin password
  app.post('/api/auth/login', (req, res) => {
    const { password } = req.body || {};
    if (!password || typeof password !== 'string') {
      res.status(400).json({ success: false, error: 'Wprowadź kod dostępu.' });
      return;
    }

    const isValid = verifyPassword(password.trim());
    if (!isValid) {
      res.status(401).json({ success: false, error: 'Nieprawidłowy kod dostępu.' });
      return;
    }

    const token = generateAdminToken();
    res.json({ success: true, token });
  });

  // Verify active session token
  app.get('/api/auth/verify', (req, res) => {
    const authHeader = req.headers.authorization;
    const isValid = verifyAdminToken(authHeader);
    res.json({ valid: isValid });
  });

  // ==========================================
  // REVIEWS API
  // ==========================================

  // Get reviews (public: published only; admin: all reviews)
  app.get('/api/reviews', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const isAdmin = verifyAdminToken(authHeader);

      const reviews = await getReviews(isAdmin);
      res.json({ success: true, reviews, isAdmin });
    } catch (err) {
      console.error('[API] Error fetching reviews:', err);
      res.status(500).json({ success: false, error: 'Błąd podczas pobierania opinii.' });
    }
  });

  // Get admin statistics
  app.get('/api/admin/stats', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!verifyAdminToken(authHeader)) {
      res.status(401).json({ success: false, error: 'Brak uprawnień.' });
      return;
    }

    try {
      const stats = await getReviewStats();
      res.json({ success: true, stats });
    } catch (err) {
      console.error('[API] Error fetching stats:', err);
      res.status(500).json({ success: false, error: 'Błąd podczas pobierania statystyk.' });
    }
  });

  // Create review (Admin only)
  app.post('/api/reviews', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!verifyAdminToken(authHeader)) {
      res.status(401).json({ success: false, error: 'Brak uprawnień.' });
      return;
    }

    const { name, service, rating, text, date, published } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim() === '') {
      res.status(400).json({ success: false, error: 'Pole Imię jest wymagane.' });
      return;
    }

    if (!ALLOWED_SERVICES.includes(service as ServiceType)) {
      res.status(400).json({
        success: false,
        error: `Pole Usługa musi być jednym z: ${ALLOWED_SERVICES.join(', ')}`,
      });
      return;
    }

    if (!text || typeof text !== 'string' || text.trim() === '') {
      res.status(400).json({ success: false, error: 'Treść opinii jest wymagana.' });
      return;
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      res.status(400).json({ success: false, error: 'Ocena musi wynosić od 1 do 5.' });
      return;
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

      res.status(201).json({
        success: true,
        review: created,
        message: 'Opinia została dodana.',
      });
    } catch (err) {
      console.error('[API] Error creating review:', err);
      res.status(500).json({ success: false, error: 'Błąd podczas dodawania opinii.' });
    }
  });

  // Update review (Admin only)
  app.put('/api/reviews/:id', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!verifyAdminToken(authHeader)) {
      res.status(401).json({ success: false, error: 'Brak uprawnień.' });
      return;
    }

    const { id } = req.params;
    const { name, service, rating, text, date, published } = req.body || {};

    if (service && !ALLOWED_SERVICES.includes(service as ServiceType)) {
      res.status(400).json({
        success: false,
        error: `Pole Usługa musi być jednym z: ${ALLOWED_SERVICES.join(', ')}`,
      });
      return;
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
        res.status(404).json({ success: false, error: 'Nie znaleziono opinii.' });
        return;
      }

      res.json({ success: true, review: updated, message: 'Opinia została zaktualizowana.' });
    } catch (err) {
      console.error('[API] Error updating review:', err);
      res.status(500).json({ success: false, error: 'Błąd podczas aktualizacji opinii.' });
    }
  });

  // Delete review (Admin only)
  app.delete('/api/reviews/:id', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!verifyAdminToken(authHeader)) {
      res.status(401).json({ success: false, error: 'Brak uprawnień.' });
      return;
    }

    const { id } = req.params;

    try {
      const deleted = await deleteReview(id);
      if (!deleted) {
        res.status(404).json({ success: false, error: 'Nie znaleziono opinii.' });
        return;
      }

      res.json({ success: true, message: 'Opinia została usunięta.' });
    } catch (err) {
      console.error('[API] Error deleting review:', err);
      res.status(500).json({ success: false, error: 'Błąd podczas usuwania opinii.' });
    }
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'jmoon-reviews' });
  });

  // ==========================================
  // VITE / STATIC ASSETS
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`J.Moon server running on port ${PORT}`);
  });
}

startServer();
