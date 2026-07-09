/**
 * Batch link health checks for the configuration editor.
 * Checks availability, response time, redirects and HTTPS certificate expiry.
 */
const http = require('http');
const https = require('https');

const REQUEST_TIMEOUT = 8000;
const MAX_REDIRECTS = 5;
const MAX_LINKS = 300;
const CONCURRENCY = 8;
const DAY_MS = 24 * 60 * 60 * 1000;

const hasProtocol = (url) => /^[a-z][a-z0-9+.-]*:\/\//i.test(url);

const normalizeUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  try {
    const trimmed = rawUrl.trim();
    const withProtocol = hasProtocol(trimmed) ? trimmed : `https://${trimmed}`;
    return new URL(withProtocol).toString();
  } catch (e) {
    return '';
  }
};

const isSuccessStatus = (statusCode) => statusCode >= 200 && statusCode < 400;

const certificateInfo = (response) => {
  if (!response.socket || typeof response.socket.getPeerCertificate !== 'function') return {};
  const certificate = response.socket.getPeerCertificate();
  if (!certificate || !certificate.valid_to) return {};
  const expiresAt = new Date(certificate.valid_to);
  if (Number.isNaN(expiresAt.getTime())) return {};
  return {
    certificateExpiresAt: expiresAt.toISOString(),
    certificateDaysRemaining: Math.ceil((expiresAt.getTime() - Date.now()) / DAY_MS),
  };
};

const makeRequest = (targetUrl, method) => new Promise((resolve) => {
  const parsed = new URL(targetUrl);
  const transport = parsed.protocol === 'https:' ? https : http;
  const request = transport.request(parsed, {
    method,
    timeout: REQUEST_TIMEOUT,
    headers: {
      'user-agent': 'LaoWang-Nav-Link-Health/1.0',
      accept: '*/*',
    },
  }, (response) => {
    const result = {
      protocol: parsed.protocol,
      statusCode: response.statusCode || 0,
      statusText: response.statusMessage || '',
      redirectTo: response.headers.location
        ? new URL(response.headers.location, parsed).toString()
        : '',
      ...certificateInfo(response),
    };
    response.resume();
    response.on('end', () => resolve(result));
  });

  request.on('timeout', () => {
    request.destroy(new Error('Request timed out'));
  });
  request.on('error', (error) => {
    resolve({
      protocol: parsed.protocol,
      statusCode: 0,
      statusText: '',
      error: error.message,
      code: error.code || 'REQUEST_ERROR',
    });
  });
  request.end();
});

const checkUrl = async (rawUrl, targetUrl, method, redirectCount, startedAt) => {
  const result = await makeRequest(targetUrl, method);
  const canRedirect = result.redirectTo
    && result.statusCode >= 300
    && result.statusCode < 400
    && redirectCount < MAX_REDIRECTS;
  if (canRedirect) {
    return checkUrl(rawUrl, result.redirectTo, method, redirectCount + 1, startedAt);
  }
  if (result.statusCode === 405 && method === 'HEAD') {
    return checkUrl(rawUrl, targetUrl, 'GET', redirectCount, startedAt);
  }
  return {
    ...result,
    url: rawUrl,
    finalUrl: targetUrl,
    redirectCount,
    durationMs: Date.now() - startedAt,
    ok: isSuccessStatus(result.statusCode),
  };
};

const checkItem = async (item) => {
  const normalized = normalizeUrl(item.url);
  if (!normalized) {
    return {
      ...item,
      ok: false,
      statusCode: 0,
      statusText: '',
      error: 'Invalid URL',
      code: 'INVALID_URL',
    };
  }
  const checked = await checkUrl(item.url, normalized, 'HEAD', 0, Date.now());
  return {
    ...item,
    ...checked,
  };
};

const runQueue = async (items) => {
  const results = [];
  let nextIndex = 0;
  const workerCount = Math.min(CONCURRENCY, items.length);
  const workers = Array.from({ length: workerCount }).map(async () => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await checkItem(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
};

module.exports = async (body = {}) => {
  const rawItems = Array.isArray(body.items) ? body.items : [];
  const items = rawItems
    .filter(item => item && item.url)
    .slice(0, MAX_LINKS)
    .map(item => ({
      title: item.title || item.url,
      url: item.url,
      sectionName: item.sectionName || '',
    }));
  const results = await runQueue(items);
  return {
    success: true,
    checkedAt: new Date().toISOString(),
    total: results.length,
    results,
  };
};
