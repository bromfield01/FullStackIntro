// backend/src/routes/users.js
import { createUser, loginUser } from '../services/users.js';

export function userRoutes(app) {
  // POST /signup
  app.post('/api/v1/user/signup', async (req, res) => {
    try {
      const user = await createUser(req.body);
      return res.status(201).json({ username: user.username });
    } catch (err) {
      return res.status(400).json({
        error: 'failed to create the user, does the username already exist?',
      });
    }
  });

  // POST /login
  app.post('/api/v1/user/login', async (req, res) => {
    try {
      const token = await loginUser(req.body); // returns a string
      return res.status(200).json({ token });
    } catch (err) {
      console.error('LOGIN ERROR:', err?.message || err);
      return res.status(400).json({
        error: 'login failed, did you enter the correct username/password?',
        detail: err?.message ?? undefined, // optional during dev
      });
    }
  });
}
