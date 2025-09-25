// backend/src/services/users.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../db/models/user.js';

// Create a new user with a hashed password
export async function createUser({ username, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  return await user.save();
}

// Log in a user and return a JWT
export async function loginUser({ username, password }) {
  // Find user by username
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error('invalid username!');
  }

  // Compare hashed password
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    throw new Error('invalid password!');
  }

  // Create JWT token
  const token = jwt.sign(
    { sub: user._id }, // subject = user id
    process.env.JWT_SECRET, // secret key from .env
    { expiresIn: '24h' }, // token lifetime
  );

  return token;
}
