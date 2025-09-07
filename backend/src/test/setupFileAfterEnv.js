// test/setupFileAfterEnv.js
import { beforeAll, afterAll, jest } from '@jest/globals';
import { initDatabase, closeDatabase } from '../db/init.js';

jest.setTimeout(30_000);

beforeAll(async () => {
  if (!process.env.MONGODB_URI && !process.env.DATABASE_URL) {
    throw new Error(
      'MONGODB_URI (or DATABASE_URL) is not set. Did globalSetup run?',
    );
  }
  await initDatabase(); // IMPORTANT: actually call the function
}, 30_000);

afterAll(async () => {
  // Clean shutdown so Jest can exit without --detectOpenHandles
  await closeDatabase({ drop: true });
}, 30_000);
