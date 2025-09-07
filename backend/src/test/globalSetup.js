/* eslint-env node, jest */
import { MongoMemoryServer } from 'mongodb-memory-server';

export default async function globalSetup() {
  const mongod = await MongoMemoryServer.create({
    binary: { version: '8.0.10' },
    instance: { dbName: 'jest' },
  });

  global.__MONGOD__ = mongod;
  global.__MONGOINSTANCE = mongod;

  process.env.MONGODB_URI = mongod.getUri();
  process.env.NODE_ENV = process.env.NODE_ENV || 'test';
}
