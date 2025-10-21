// src/request.js
export function createFetchRequest(req) {
  const controller = new AbortController();
  req.on('close', () => controller.abort());

  // Build absolute origin (respect proxies like Codespaces/NGINX)
  const proto =
    (req.headers['x-forwarded-proto'] &&
      String(req.headers['x-forwarded-proto']).split(',')[0]) ||
    req.protocol ||
    'http';

  const host =
    (req.headers['x-forwarded-host'] &&
      String(req.headers['x-forwarded-host']).split(',')[0]) ||
    req.headers.host;

  const origin = `${proto}://${host}`;
  const url = new URL(req.originalUrl || req.url, origin);

  // Copy headers
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const v of value) headers.append(key, v);
    } else {
      headers.set(key, String(value));
    }
  }

  // Build fetch init
  const init = {
    method: req.method,
    headers,
    signal: controller.signal,
  };

  // Only attach body for non-GET/HEAD
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    // Express may have parsed req.body already
    const hasCT = headers.has('content-type');
    if (
      req.body != null &&
      (typeof req.body === 'string' || Buffer.isBuffer(req.body))
    ) {
      init.body = req.body;
    } else if (req.body != null) {
      init.body = JSON.stringify(req.body);
      if (!hasCT) headers.set('content-type', 'application/json');
    }
  }

  return new Request(url, init);
}
