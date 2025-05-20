/**
 * Minimal MD5 implementation (https://github.com/blueimp/JavaScript-MD5, MIT, trimmed for brevity)
 * and stable JSON stringify for consistent hashing.
 */
export function md5cycle(x: number[], k: number[]) {
  let [a, b, c, d] = x
  function ff(a, b, c, d, x, s, t) {
    a = a + ((b & c) | (~b & d)) + x + t
    return ((a << s) | (a >>> (32 - s))) + b
  }
  function gg(a, b, c, d, x, s, t) {
    a = a + ((b & d) | (c & ~d)) + x + t
    return ((a << s) | (a >>> (32 - s))) + b
  }
  function hh(a, b, c, d, x, s, t) {
    a = a + (b ^ c ^ d) + x + t
    return ((a << s) | (a >>> (32 - s))) + b
  }
  function ii(a, b, c, d, x, s, t) {
    a = a + (c ^ (b | ~d)) + x + t
    return ((a << s) | (a >>> (32 - s))) + b
  }
  a = ff(a, b, c, d, k[0], 7, -680876936)
  d = ff(d, a, b, c, k[1], 12, -389564586)
  c = ff(c, d, a, b, k[2], 17, 606105819)
  b = ff(b, c, d, a, k[3], 22, -1044525330)
  a = ff(a, b, c, d, k[4], 7, -176418897)
  d = ff(d, a, b, c, k[5], 12, 1200080426)
  c = ff(c, d, a, b, k[6], 17, -1473231341)
  b = ff(b, c, d, a, k[7], 22, -45705983)
  a = ff(a, b, c, d, k[8], 7, 1770035416)
  d = ff(d, a, b, c, k[9], 12, -1958414417)
  c = ff(c, d, a, b, k[10], 17, -42063)
  b = ff(b, c, d, a, k[11], 22, -1990404162)
  a = ff(a, b, c, d, k[12], 7, 1804603682)
  d = ff(d, a, b, c, k[13], 12, -40341101)
  c = ff(c, d, a, b, k[14], 17, -1502002290)
  b = ff(b, c, d, a, k[15], 22, 1236535329)
  a = gg(a, b, c, d, k[1], 5, -165796510)
  d = gg(d, a, b, c, k[6], 9, -1069501632)
  c = gg(c, d, a, b, k[11], 14, 643717713)
  b = gg(b, c, d, a, k[0], 20, -373897302)
  a = gg(a, b, c, d, k[5], 5, -701558691)
  d = gg(d, a, b, c, k[10], 9, 38016083)
  c = gg(c, d, a, b, k[15], 14, -660478335)
  b = gg(b, c, d, a, k[4], 20, -405537848)
  a = gg(a, b, c, d, k[9], 5, 568446438)
  d = gg(d, a, b, c, k[14], 9, -1019803690)
  c = gg(c, d, a, b, k[3], 14, -187363961)
  b = gg(b, c, d, a, k[8], 20, 1163531501)
  a = gg(a, b, c, d, k[13], 5, -1444681467)
  d = gg(d, a, b, c, k[2], 9, -51403784)
  c = gg(c, d, a, b, k[7], 14, 1735328473)
  b = gg(b, c, d, a, k[12], 20, -1926607734)
  a = hh(a, b, c, d, k[5], 4, -378558)
  d = hh(d, a, b, c, k[8], 11, -2022574463)
  c = hh(c, d, a, b, k[11], 16, 1839030562)
  b = hh(b, c, d, a, k[14], 23, -35309556)
  a = hh(a, b, c, d, k[1], 4, -1530992060)
  d = hh(d, a, b, c, k[4], 11, 1272893353)
  c = hh(c, d, a, b, k[7], 16, -155497632)
  b = hh(b, c, d, a, k[10], 23, -1094730640)
  a = hh(a, b, c, d, k[13], 4, 681279174)
  d = hh(d, a, b, c, k[0], 11, -358537222)
  c = hh(c, d, a, b, k[3], 16, -722521979)
  b = hh(b, c, d, a, k[6], 23, 76029189)
  a = hh(a, b, c, d, k[9], 4, -640364487)
  d = hh(d, a, b, c, k[12], 11, -421815835)
  c = hh(c, d, a, b, k[15], 16, 530742520)
  b = hh(b, c, d, a, k[2], 23, -995338651)
  a = ii(a, b, c, d, k[0], 6, -198630844)
  d = ii(d, a, b, c, k[7], 10, 1126891415)
  c = ii(c, d, a, b, k[14], 15, -1416354905)
  b = ii(b, c, d, a, k[5], 21, -57434055)
  a = ii(a, b, c, d, k[12], 6, 1700485571)
  d = ii(d, a, b, c, k[3], 10, -1894986606)
  c = ii(c, d, a, b, k[10], 15, -1051523)
  b = ii(b, c, d, a, k[1], 21, -2054922799)
  a = ii(a, b, c, d, k[8], 6, 1873313359)
  d = ii(d, a, b, c, k[15], 10, -30611744)
  c = ii(c, d, a, b, k[6], 15, -1560198380)
  b = ii(b, c, d, a, k[13], 21, 1309151649)
  a = ii(a, b, c, d, k[4], 6, -145523070)
  d = ii(d, a, b, c, k[11], 10, -1120210379)
  c = ii(c, d, a, b, k[2], 15, 718787259)
  b = ii(b, c, d, a, k[9], 21, -343485551)
  x[0] = (x[0] + a) | 0
  x[1] = (x[1] + b) | 0
  x[2] = (x[2] + c) | 0
  x[3] = (x[3] + d) | 0
}
function md5blk(s: string) {
  let md5blks = [], i
  for (i = 0; i < 64; i += 4) {
    md5blks[i >> 2] = s.charCodeAt(i) +
      (s.charCodeAt(i + 1) << 8) +
      (s.charCodeAt(i + 2) << 16) +
      (s.charCodeAt(i + 3) << 24)
  }
  return md5blks
}
function md5blk_array(a: number[]) {
  let md5blks = [], i
  for (i = 0; i < 64; i += 4) {
    md5blks[i >> 2] = a[i] +
      (a[i + 1] << 8) +
      (a[i + 2] << 16) +
      (a[i + 3] << 24)
  }
  return md5blks
}
function md51(s: string) {
  let n = s.length,
    state = [1732584193, -271733879, -1732584194, 271733878],
    i, length, tail, tmp, lo, hi
  for (i = 64; i <= n; i += 64) {
    md5cycle(state, md5blk(s.substring(i - 64, i)))
  }
  s = s.substring(i - 64)
  tail = new Array(64).fill(0)
  for (i = 0; i < s.length; i++)
    tail[i] = s.charCodeAt(i)
  tail[i] = 0x80
  if (i > 55) {
    md5cycle(state, md5blk_array(tail))
    tail.fill(0)
  }
  // append length in bits
  let bitLen = n * 8
  tail[56] = bitLen & 0xff
  tail[57] = (bitLen >>> 8) & 0xff
  tail[58] = (bitLen >>> 16) & 0xff
  tail[59] = (bitLen >>> 24) & 0xff
  md5cycle(state, md5blk_array(tail))
  return state
}
function rhex(n: number) {
  let s = '', j
  for (j = 0; j < 4; j++)
    s += ('0' + ((n >> (j * 8)) & 0xff).toString(16)).slice(-2)
  return s
}
function hex(x: number[]) {
  for (let i = 0; i < x.length; i++)
    x[i] = parseInt(rhex(x[i]), 16)
  return x.map(n => rhex(n)).join('')
}
export function md5(s: string) {
  return hex(md51(s))
}

// Stable JSON stringify (sorted keys, handles arrays/objects)
export function stableStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj)
  if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(',')}]`
  return '{' + Object.keys(obj).sort().map(k => JSON.stringify(k) + ':' + stableStringify(obj[k])).join(',') + '}'
}

// Hash any object, excluding a given field (e.g. 'hash')
export function hashObject(obj: any, excludeField: string = 'hash'): string {
  if (!obj || typeof obj !== 'object') return md5(stableStringify(obj))
  const { [excludeField]: _, ...rest } = obj
  return md5(stableStringify(rest))
}
