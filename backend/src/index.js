// src/index.js
import 'dotenv/config';

import { initDatabase } from './db/init.js';
import { app } from './app.js';

const PORT = Number.parseInt(process.env.PORT ?? '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

await initDatabase();
app.listen(PORT, HOST, () => {
  console.info(`🚀 Express server running at http://${HOST}:${PORT}`);
});
