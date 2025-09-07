/* eslint-env node, jest */
export default async function globalTeardown() {
  const mongod = global.__MONGOD__ || global.__MONGOINSTANCE;
  if (mongod && typeof mongod.stop === 'function') {
    await mongod.stop();
  }
}
