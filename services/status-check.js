/**
 * This file contains the Node.js code, used for the optional status check feature
 * It accepts a single url parameter, and will make an empty GET request to that
 * endpoint, and then resolve the response status code, time taken, and short message
 */
const axios = require('axios').default;
const https = require('https');
const { assertHostAllowed } = require('./ssrf-guard');

/* Fallback redirect cap when the caller does not pass a numeric maxRedirects */
const DEFAULT_MAX_REDIRECTS = 5;

const parseMaxRedirects = (value) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) return DEFAULT_MAX_REDIRECTS;
  return Math.min(parsed, 10);
};

/* Determines if successful from the HTTP response code */
const getResponseType = (code, validCodes) => {
  if (validCodes && String(validCodes).includes(String(code))) return true;
  if (Number.isNaN(code)) return false;
  const numericCode = parseInt(code, 10);
  return (numericCode >= 200 && numericCode <= 302);
};

/* Makes human-readable response text for successful check */
const makeMessageText = (data) => `${data.successStatus ? '✅' : '⚠️'} `
  + `${data.serverName || 'Server'} responded with `
  + `${data.statusCode} - ${data.statusText}. `
  + `\n⏱️Took ${data.timeTaken} ms`;

/* Makes human-readable response text for failed check */
const makeErrorMessage = (data) => `❌ Service Unavailable: ${data.hostname || 'Server'} `
  + `resulted in ${data.code || 'a fatal error'} ${data.errno ? `(${data.errno})` : ''}`;

const makeErrorMessage2 = (data) => '❌ Service Error - '
  + `${data.status} - ${data.statusText}`;

/* Kicks off an HTTP request, then formats and renders results.
 * SSRF guard: the target of every hop (initial URL and each redirect) is
 * validated with assertHostAllowed before the request is made, so a public
 * URL that redirects to a private / loopback / link-local address is
 * rejected instead of followed. Redirects are therefore followed by
 * recursion (maxRedirects: 0 + validateStatus accepting all statuses)
 * instead of letting axios follow them unchecked. Private targets are
 * rejected unless NAV_ALLOW_PRIVATE_TARGETS=1 (see README "安全说明"). */
const makeRequest = async (url, options, render) => {
  const {
    headers, enableInsecure, acceptCodes, maxRedirects,
  } = options;
  const validCodes = acceptCodes && acceptCodes !== 'null' ? acceptCodes : null;
  const maxHops = parseMaxRedirects(maxRedirects);
  const startTime = new Date();
  const requestMaker = axios.create({
    httpsAgent: new https.Agent({
      rejectUnauthorized: !enableInsecure,
    }),
  });

  // One hop: validate the target, then request it. Returns a result object
  // describing what happened, so the caller can render it exactly once.
  const fetchHop = async (currentUrl, hops) => {
    let parsed;
    try {
      parsed = new URL(currentUrl);
    } catch (e) {
      return { kind: 'blocked', reason: 'Invalid URL' };
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { kind: 'blocked', reason: 'Only http and https URLs are allowed' };
    }
    try {
      await assertHostAllowed(parsed.hostname);
    } catch (e) {
      return { kind: 'blocked', reason: e.message };
    }

    let response;
    try {
      response = await requestMaker.request({
        url: currentUrl,
        headers,
        maxRedirects: 0,
        validateStatus: () => true,
      });
    } catch (error) {
      return { kind: 'error', error };
    }

    const followsRedirect = response.status >= 300 && response.status < 400
      && response.headers.location && hops < maxHops;
    if (followsRedirect) {
      let nextUrl;
      try {
        nextUrl = new URL(response.headers.location, currentUrl).toString();
      } catch (e) {
        return { kind: 'blocked', reason: 'Invalid redirect URL' };
      }
      return fetchHop(nextUrl, hops + 1);
    }
    return { kind: 'response', response };
  };

  const outcome = await fetchHop(url, 0);
  if (outcome.kind === 'blocked') {
    render(JSON.stringify({
      successStatus: false,
      message: `❌ Service check blocked: ${outcome.reason}`,
    }));
    return;
  }
  if (outcome.kind === 'error') {
    render(JSON.stringify({
      successStatus: false,
      message: makeErrorMessage(outcome.error),
    }));
    return;
  }

  const { response } = outcome;
  // Non-2xx final response: same outcome as the old axios error path
  if (response.status < 200 || response.status >= 300) {
    if (validCodes && String(validCodes).includes(String(response.status))) {
      const results = {
        successStatus: getResponseType(response.status, validCodes),
        statusCode: response.status,
        statusText: response.statusText,
        timeTaken: (new Date() - startTime),
      };
      results.message = makeMessageText(results);
      render(JSON.stringify(results));
    } else {
      render(JSON.stringify({
        successStatus: false,
        message: makeErrorMessage2(response),
      }));
    }
    return;
  }

  const statusCode = response.status;
  const { statusText } = response;
  const successStatus = getResponseType(statusCode, validCodes);
  const serverName = response.request.socket && response.request.socket.servername;
  const timeTaken = (new Date() - startTime);
  const results = {
    statusCode, statusText, serverName, successStatus, timeTaken,
  };
  results.message = makeMessageText(results);
  render(JSON.stringify(results));
};

const decodeHeaders = (maybeHeaders) => {
  if (!maybeHeaders) return {};
  const decodedHeaders = decodeURIComponent(maybeHeaders);
  let parsedHeaders = {};
  try {
    parsedHeaders = JSON.parse(decodedHeaders);
  } catch (e) { /* Not valid JSON, will just return false */ }
  return parsedHeaders;
};

/* Returned if the URL param is not present or correct */
const immediateError = (render) => {
  render(JSON.stringify({
    successStatus: false,
    message: '❌ Missing or Malformed URL',
  }));
};

/* Main function, will check if a URL present, and call function */
module.exports = (paramStr, render) => {
  if (!paramStr || !paramStr.includes('=')) {
    immediateError(render);
  } else {
    // Prepare the parameters, which are got from the URL
    const params = new URLSearchParams(paramStr);
    const url = decodeURIComponent(params.get('url'));
    const acceptCodes = decodeURIComponent(params.get('acceptCodes'));
    const maxRedirects = decodeURIComponent(params.get('maxRedirects')) || 0;
    const headers = decodeHeaders(params.get('headers'));
    const enableInsecure = !!params.get('enableInsecure');
    if (!url || url === 'undefined') immediateError(render);
    const options = {
      headers, enableInsecure, acceptCodes, maxRedirects,
    };
    makeRequest(url, options, render).catch((e) => {
      render(JSON.stringify({
        successStatus: false,
        message: `❌ Service check failed: ${e.message || 'unexpected error'}`,
      }));
    });
  }
};
