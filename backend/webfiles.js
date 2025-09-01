import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('content-Type', 'application/json');
  res.end(readFileSync('backend/users.json'));
});

const host = 'localhost';
const port = 3000;
server.listen(port, host, () => {
  console.log(`server listening on http://${host}:${port}`);
});
