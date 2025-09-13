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

export function postsRoutes(app) {
  // GET /api/v1/posts?author=... | ?tag=... | ?tags=a,b | ?sortBy=...&sortOrder=asc|desc
  app.get('/api/v1/posts', async (req, res) => {
    const { author, tag, tags, sortBy, sortOrder } = req.query;
    const options = { sortBy, sortOrder };

    try {
      const hasAuthor = typeof author === 'string' && author.trim() !== '';
      const tagParam = tags ?? tag; // support either ?tag=... or ?tags=...
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
        const posts = await listPostsByAuthor(author, options);
        return res.json(posts);
      }

      if (hasTag) {
        // Accept comma-separated string or repeated query (?tags=a&tags=b)
        const values = Array.isArray(tagParam)
          ? tagParam
          : String(tagParam)
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
        const posts = await listPostsByTag(
          values.length === 1 ? values[0] : values,
          options,
        );
        return res.json(posts);
      }

      const posts = await listAllPosts(options);
      return res.json(posts);
    } catch (err) {
      console.error('error listing posts', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // GET /api/v1/posts/:id
  app.get('/api/v1/posts/:id', async (req, res) => {
    try {
      const post = await getPostById(req.params.id);
      if (post === null) return res.status(404).end();
      return res.json(post);
    } catch (err) {
      console.error('error getting post', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // POST /api/v1/posts
  // body: { title (required), author?, contents?, tags?: string|string[] }
  app.post('/api/v1/posts', async (req, res) => {
    try {
      let { title, author, contents, tags } = req.body ?? {};
      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'title is required' });
      }

      // Normalize tags if a comma-separated string is provided
      if (typeof tags === 'string') {
        tags = tags
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }

      const created = await createPost({
        title: title.trim(),
        author,
        contents,
        tags,
      });
      return res.status(201).json(created);
    } catch (err) {
      console.error('error creating post', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // PATCH /api/v1/posts/:id
  // body: any subset of { title, author, contents, tags }
  app.patch('/api/v1/posts/:id', async (req, res) => {
    try {
      const updates = { ...req.body };

      // Normalize tags if sent as a comma-separated string
      if (typeof updates.tags === 'string') {
        updates.tags = updates.tags
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }

      const updated = await updatePostById(req.params.id, updates);
      if (updated === null) return res.status(404).end();
      return res.json(updated);
    } catch (err) {
      console.error('error updating post', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // DELETE /api/v1/posts/:id
  app.delete('/api/v1/posts/:id', async (req, res) => {
    try {
      const deleted = await deletePostById(req.params.id);
      if (deleted === null) return res.status(404).end();
      return res.status(204).end();
    } catch (err) {
      console.error('error deleting post', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });
}
