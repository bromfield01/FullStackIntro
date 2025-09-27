import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../db/models/user.js';

const { JWT_SECRET } = process.env;

export async function createUser({ username, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  // schema will trim/lowercase on save, so no need to do it here
  const user = new User({ username, password: hashedPassword });
  return await user.save();
}

export async function loginUser({ username, password }) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET is not set');

  // IMPORTANT: select the password hash; also normalize the query
  const normalized = String(username ?? '')
    .trim()
    .toLowerCase();
  const user = await User.findOne({ username: normalized }).select('+password');

  if (!user || !user.password) {
    throw new Error('invalid username!');
  }

  const ok = await bcrypt.compare(String(password), String(user.password));
  if (!ok) throw new Error('invalid password!');

  const token = jwt.sign(
    { sub: user._id.toString(), username: user.username },
    JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '24h' },
  );

  return token; // string
}
