/**
 * A simple CORS proxy, for accessing API services which aren't CORS-enabled.
 * Receives requests from frontend, applies correct access control headers,
 * makes request to endpoint, then responds to the frontend with the response.
 *
 * SECURITY (2026-11-24): this proxy used to forward to any Target-URL with
 * no restriction (open SSRF proxy). It is now:
 * - DISABLED BY DEFAULT: only enabled when CORS_PROXY_ENABLED=1.
 * - ALLOWLISTED: the target host must be listed in CORS_PROXY_ALLOWLIST
 *   (comma-separated hostnames; a leading "." entry also matches subdomains).
 *   With the proxy enabled but no allowlist configured, every request is
 *   denied (fail closed).
 * - http/https only; URLs with embedded credentials are rejected.
 * - Private / loopback / link-local targets (literal or DNS-resolved) are
 *   rejected unless CORS_PROXY_ALLOW_PRIVATE=1 is set explicitly. This
 *   matters because widgets otherwise proxy to LAN services; the allowlist
 *   alone does not authorize a private target.
 * See README "安全说明" for the environment variables.
 */

const axios = require('axios');
const { assertHostAllowed } = require('./ssrf-guard');

const PROXY_TIMEOUT_MS = 15000;

const isProxyEnabled = () => process.env.CORS_PROXY_ENABLED === '1';

const allowPrivateProxyTargets = () => process.env.CORS_PROXY_ALLOW_PRIVATE === '1';

const allowlist = () => (process.env.CORS_PROXY_ALLOWLIST || '')
  .split(',')
  .map((entry) => entry.trim().toLowerCase())
  .filter(Boolean);

const isAllowlisted = (hostname) => {
  const host = String(hostname || '').toLowerCase();
  return allowlist().some((entry) => {
    if (entry.startsWith('.')) return host === entry.slice(1) || host.endsWith(entry);
    return host === entry;
  });
};

module.exports = async (req, res) => {
  // Apply allow-all response headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, PATCH, POST, DELETE');
  if (req.header('access-control-request-headers')) {
    res.header('Access-Control-Allow-Headers', req.header('access-control-request-headers'));
  }

  // Proxy disabled by default: refuse everything, including pre-flight
  if (!isProxyEnabled()) {
    res.status(403).send({
      error: 'CORS proxy is disabled. Set CORS_PROXY_ENABLED=1 and CORS_PROXY_ALLOWLIST to enable it.',
    });
    return;
  }

  // Pre-flight
  if (req.method === 'OPTIONS') {
    res.send();
    return;
  }

  // Get desired URL, from Target-URL header
  const targetURL = req.header('Target-URL');
  if (!targetURL) {
    res.status(500).send({ error: 'There is no Target-Endpoint header in the request' });
    return;
  }

  let target;
  try {
    target = new URL(targetURL);
  } catch (e) {
    res.status(400).send({ error: 'Target-URL is not a valid URL' });
    return;
  }
  if (!['http:', 'https:'].includes(target.protocol)) {
    res.status(400).send({ error: 'Target-URL must use http or https' });
    return;
  }
  if (target.username || target.password) {
    res.status(400).send({ error: 'Target-URL must not contain credentials' });
    return;
  }
  if (!isAllowlisted(target.hostname)) {
    res.status(403).send({ error: 'Target host is not in CORS_PROXY_ALLOWLIST' });
    return;
  }
  if (!allowPrivateProxyTargets()) {
    try {
      await assertHostAllowed(target.hostname);
    } catch (e) {
      res.status(e.status || 400).send({ error: e.message });
      return;
    }
  }

  // Apply any custom headers, if needed
  let headers = {};
  try {
    headers = req.header('CustomHeaders') ? JSON.parse(req.header('CustomHeaders')) : {};
  } catch (e) {
    res.status(400).send({ error: 'CustomHeaders is not valid JSON' });
    return;
  }

  // Prepare the request
  const requestConfig = {
    method: req.method,
    url: targetURL,
    data: req.body,
    headers,
    timeout: PROXY_TIMEOUT_MS,
  };

  // Make the request, and respond with result.
  // NOTE: axios follows redirects from an allowlisted host by default.
  // A redirect to a non-allowlisted / private host is not re-validated here;
  // the allowlisted origin itself is admin-trusted. Keep allowlist entries
  // to origins you trust not to redirect to internal addresses.
  try {
    const response = await axios.request(requestConfig);
    res.status(200).send(response.data);
  } catch (error) {
    res.status(500).send({ error: error.message || 'Proxy request failed' });
  }
};
