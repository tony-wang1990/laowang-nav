'use strict';

if (typeof globalThis.crypto === 'undefined') {
  const { webcrypto } = require('crypto');

  if (webcrypto) {
    globalThis.crypto = webcrypto;
  }
}
