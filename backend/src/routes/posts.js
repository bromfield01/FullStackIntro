// backend/src/routes/posts.js
import {
  listAllPosts,
  listPostsByAuthor,
  listPostsByTag,
  getPostById,
  createPost,
  updatePostById,
  deletePostById,
} from '../services/posts.js';

import { requireAuth } from '../middleware/jwt.js';

export function postsRoutes(app) {
  // --------------------------------------------------
  // PUBLIC: GET /api/v1/posts
  //   ?author=... | ?tag=... | ?tags=a,b | ?sortBy=...&sortOrder=asc|desc
  // --------------------------------------------------
  app.get('/api/v1/posts', async (req, res) => {
    const { author, tag, tags, sortBy, sortOrder } = req.query;
    const options = { sortBy, sortOrder };

    try {
      const hasAuthor = typeof author === 'string' && author.trim() !== '';
      const tagParam = tags ?? tag;
      const hasTag =
        typeof tagParam !== 'undefined' &&
        tagParam !== null &&
        String(tagParam).trim() !== '';

      if (hasAuthor && hasTag) {
        return res
          .status(400)
          .json({ error: 'Query by either author or tag, not both.' });
      }

      if (hasAuthor) {
        // NOTE: If your services are user-scoped, ensure listPostsByAuthor
        //       supports public read (e.g., by ignoring userId or exposing a public variant).
        const posts = await listPostsByAuthor(author, options);
        return res.json(posts);
      }

      if (hasTag) {
        const values = Array.isArray(tagParam)
          ? tagParam
          : String(tagParam)
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
        const posts = await listPostsByTag(values, options);
        return res.json(posts);
      }

      const posts = await listAllPosts(options);
      return res.json(posts);
    } catch (err) {
      console.error('error listing posts', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // --------------------------------------------------
  // PUBLIC: GET /api/v1/posts/:id
  // --------------------------------------------------
  app.get('/api/v1/posts/:id', async (req, res) => {
    try {
      // NOTE: If your services are user-scoped, ensure getPostById
      //       supports public read or add a public variant.
      const post = await getPostById(req.params.id);
      if (post === null) return res.status(404).end();
      return res.json(post);
    } catch (err) {
      console.error('error getting post', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // --------------------------------------------------
  // AUTH’D: POST /api/v1/posts
  // body: { title (required), contents?, tags?: string|string[] }
  // --------------------------------------------------
  app.post('/api/v1/posts', requireAuth, async (req, res) => {
    const userId = req.auth?.sub;

    try {
      let { title, contents, tags } = req.body ?? {};
      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'title is required' });
      }

      if (typeof tags === 'string') {
        tags = tags
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }

      const created = await createPost(userId, {
        title: title.trim(),
        contents,
        tags,
      });
      return res.status(201).json(created);
    } catch (err) {
      console.error('error creating post', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // --------------------------------------------------
  // AUTH’D: PATCH /api/v1/posts/:id
  // body: any subset of { title, contents, tags }
  // --------------------------------------------------
  app.patch('/api/v1/posts/:id', requireAuth, async (req, res) => {
    const userId = req.auth?.sub;

    try {
      const updates = { ...req.body };

      if (typeof updates.tags === 'string') {
        updates.tags = updates.tags
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }

      const updated = await updatePostById(userId, req.params.id, updates);
      if (updated === null) return res.status(404).end();
      return res.json(updated);
    } catch (err) {
      console.error('error updating post', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // --------------------------------------------------
  // AUTH’D: DELETE /api/v1/posts/:id
  // --------------------------------------------------
  app.delete('/api/v1/posts/:id', requireAuth, async (req, res) => {
    const userId = req.auth?.sub;

    try {
      const deleted = await deletePostById(userId, req.params.id);
      if (deleted === null) return res.status(404).end();
      return res.status(204).end();
    } catch (err) {
      console.error('error deleting post', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });
}
