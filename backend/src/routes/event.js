// backend/src/routes/event.js

import {
  trackEvent,
  getTotalViews,
  getDailyViews,
  getDailyDurations,
} from '../services/events.js';
import { getPostById } from '../services/posts.js';

export function eventRoutes(app) {
  // -------------------------
  // POST /api/v1/events
  // -------------------------
  app.post('/api/v1/events', async (req, res) => {
    try {
      const { postId, session, action } = req.body;

      const post = await getPostById(postId);
      if (post === null)
        return res.status(400).json({ error: 'Post not found' });

      const event = await trackEvent({ postId, session, action });
      return res.json({ session: event.session });
    } catch (err) {
      console.error('Error tracking action', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // -------------------------
  // GET /api/v1/events/totalViews/:postId
  // -------------------------
  app.get('/api/v1/events/totalViews/:postId', async (req, res) => {
    try {
      const { postId } = req.params;
      const post = await getPostById(postId);
      if (post === null)
        return res.status(400).json({ error: 'Post not found' });
      const stats = await getTotalViews(post._id);
      return res.json(stats);
    } catch (err) {
      console.error('Error fetching total views', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // -------------------------
  // GET /api/v1/events/dailyViews/:postId
  // -------------------------
  app.get('/api/v1/events/dailyViews/:postId', async (req, res) => {
    try {
      const { postId } = req.params;
      const post = await getPostById(postId);
      if (post === null)
        return res.status(400).json({ error: 'Post not found' });
      const dailyViews = await getDailyViews(post._id);
      return res.json(dailyViews);
    } catch (err) {
      console.error('Error fetching daily views', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // -------------------------
  // GET /api/v1/events/dailyDurations/:postId
  // -------------------------
  app.get('/api/v1/events/dailyDurations/:postId', async (req, res) => {
    try {
      const { postId } = req.params;
      const post = await getPostById(postId);
      if (post === null)
        return res.status(400).json({ error: 'Post not found' });
      const dailyDurations = await getDailyDurations(post._id);
      return res.json(dailyDurations);
    } catch (err) {
      console.error('Error fetching daily durations', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
}
