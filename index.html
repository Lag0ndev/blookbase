/**
 * Blookbase admin auth.
 * Password is never stored in plaintext — only SHA-256 is compared.
 * window.__bbVerify(code) returns a Promise<boolean>.
 * Looking at this file does not reveal the password.
 */
(function () {
  'use strict';

  // SHA-256 of the admin access code (hex). Plaintext is not present.
  var _H = '9c9e8256b1db825408039919a66305d6824c98641c47f296c2b4394d8756e3ac';

  function toHex(buf) {
    var a = new Uint8Array(buf);
    var s = '';
    for (var i = 0; i < a.length; i++) {
      var h = a[i].toString(16);
      s += h.length === 1 ? '0' + h : h;
    }
    return s;
  }

  function sha256hex(str) {
    if (!(window.crypto && window.crypto.subtle && window.TextEncoder)) {
      return Promise.reject(new Error('Web Crypto unavailable'));
    }
    var data = new TextEncoder().encode(str);
    return window.crypto.subtle.digest('SHA-256', data).then(toHex);
  }

  /**
   * @param {string} code
   * @returns {Promise<boolean>}
   */
  function verify(code) {
    if (typeof code !== 'string') return Promise.resolve(false);
    var trimmed = code.trim();
    if (!trimmed) return Promise.resolve(false);
    return sha256hex(trimmed)
      .then(function (hex) { return hex === _H; })
      .catch(function () { return false; });
  }

  window.__bbVerify = verify;
  try { Object.freeze(window.__bbVerify); } catch (e) {}
})();
