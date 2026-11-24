/**
 * SSRF guard: private / loopback / link-local host validation.
 *
 * Approach reused from laowang-sub-converter
 * (server/utils/subscription.js: assertHostAllowed / isPrivateHostname):
 * check the literal host first, then resolve the hostname with DNS and
 * check every resolved IP, so a public hostname that resolves to a
 * private address (DNS rebinding) is still rejected.
 *
 * Private targets are rejected by default. A self-hosted admin whose
 * dashboard legitimately checks LAN services can opt out with:
 *   NAV_ALLOW_PRIVATE_TARGETS=1
 * (see README "安全说明"). The opt-out is explicit and server-wide.
 */

const dns = require('dns');
const net = require('net');
const util = require('util');

const lookupAll = util.promisify(dns.lookup);

function allowPrivateTargets() {
  return process.env.NAV_ALLOW_PRIVATE_TARGETS === '1';
}

function expandIpv6(value) {
  let host = String(value || '').toLowerCase();
  const ipv4Match = host.match(/(\d+\.\d+\.\d+\.\d+)$/);
  if (ipv4Match) {
    const octets = ipv4Match[1].split('.').map(Number);
    if (octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) return null;
    host = `${host.slice(0, -ipv4Match[1].length)}`
      + `${(octets[0] * 256 + octets[1]).toString(16)}:${(octets[2] * 256 + octets[3]).toString(16)}`;
  }
  const parts = host.split('::');
  if (parts.length > 2) return null;
  const head = parts[0] ? parts[0].split(':') : [];
  const tail = parts[1] ? parts[1].split(':') : [];
  if (parts.length === 1 && head.length !== 8) return null;
  if (head.length + tail.length > 8) return null;
  const missing = 8 - head.length - tail.length;
  const full = [...head, ...Array(missing).fill('0'), ...tail];
  if (full.length !== 8) return null;
  const words = full.map((part) => {
    if (!/^[0-9a-f]{1,4}$/.test(part)) return NaN;
    return parseInt(part, 16);
  });
  if (words.some((word) => Number.isNaN(word))) return null;
  return words;
}

function isPrivateHostname(hostname) {
  const host = String(hostname || '').replace(/^\[|\]$/g, '').toLowerCase();
  if (!host) return true;
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local')) return true;

  if (net.isIP(host) === 4) {
    const [a, b, c] = host.split('.').map(Number);
    return a === 0
      || a === 10
      || (a === 100 && b >= 64 && b <= 127)
      || a === 127
      || (a === 169 && b === 254)
      || (a === 172 && b >= 16 && b <= 31)
      || (a === 192 && b === 168)
      || (a === 192 && b === 0 && [0, 2].includes(c))
      || (a === 198 && [18, 19].includes(b))
      || (a === 198 && b === 51 && c === 100)
      || (a === 203 && b === 0 && c === 113)
      || a >= 224;
  }

  if (net.isIP(host) === 6) {
    const words = expandIpv6(host);
    if (!words) return true;

    if (words.every((word) => word === 0)
      || (words.slice(0, 7).every((word) => word === 0) && words[7] === 1)) {
      return true;
    }

    // Unique-local fc00::/7, link-local fe80::/10, multicast ff00::/8.
    // Written as range checks to avoid bitwise ops (eslint no-bitwise).
    const first = words[0];
    if ((first >= 0xfc00 && first <= 0xfdff)
      || (first >= 0xfe80 && first <= 0xfebf)
      || first >= 0xff00) {
      return true;
    }

    if (words.slice(0, 5).every((word) => word === 0) && words[5] === 0xffff) {
      const mapped = `${Math.floor(words[6] / 256)}.${words[6] % 256}`
        + `.${Math.floor(words[7] / 256)}.${words[7] % 256}`;
      return isPrivateHostname(mapped);
    }
  }

  return false;
}

function hostError(message, code, status) {
  const err = new Error(message);
  err.code = code;
  err.status = status;
  return err;
}

/**
 * Rejects private / loopback / link-local hosts, including hostnames that
 * resolve (via DNS) to such an address. Throws an Error with .code/.status.
 */
async function assertHostAllowed(hostname) {
  if (allowPrivateTargets()) return;

  const host = String(hostname || '').replace(/^\[|\]$/g, '').toLowerCase();
  if (isPrivateHostname(host)) {
    throw hostError('Private or local addresses are not allowed', 'PRIVATE_HOST', 400);
  }

  if (!net.isIP(host)) {
    let addresses;
    try {
      addresses = await lookupAll(host, { all: true, verbatim: true });
    } catch (e) {
      throw hostError('Hostname could not be resolved', 'DNS_ERROR', 502);
    }
    if (!addresses.length || addresses.some((item) => isPrivateHostname(item.address))) {
      throw hostError(
        'Hostname resolves to a private or local address',
        'PRIVATE_HOST',
        400,
      );
    }
  }
}

module.exports = { isPrivateHostname, assertHostAllowed, allowPrivateTargets };
