/* eslint-env node */
import mongoose from 'mongoose';

let listenersAttached = false;

/**
 * Initialize a MongoDB connection (tests or runtime).
 * Prefers MONGODB_URI (set by globalSetup); falls back to DATABASE_URL.
 */
export async function initDatabase() {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  if (!uri) {
    throw new Error(
      'No MongoDB URI found. Set MONGODB_URI (preferred) or DATABASE_URL before calling initDatabase().',
    );
  }

  mongoose.set('bufferCommands', false);
  mongoose.set('strictQuery', true);

  if (
    mongoose.connection.readyState === 1 ||
    mongoose.connection.readyState === 2
  ) {
    return mongoose.connection;
  }

  if (!listenersAttached) {
    mongoose.connection.once('open', () => {
      console.info('✅ Connected to MongoDB:', maskCredentials(uri));
    });
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err?.message || err);
    });
    listenersAttached = true;
  }

  await mongoose.connect(uri, { autoIndex: true });
  return mongoose.connection;
}

export async function closeDatabase({ drop = false } = {}) {
  if (mongoose.connection.readyState !== 0) {
    try {
      if (drop) await mongoose.connection.dropDatabase();
    } finally {
      await mongoose.disconnect();
    }
  }
}

function maskCredentials(uri) {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
}
