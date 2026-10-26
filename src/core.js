/**
 * Wraps a Base64 string with RFC 2045 MIME-style CRLF line breaks.
 *
 * Per RFC 2045 (Section 6.8) and RFC 2046, Base64 output intended for MIME
 * transport MUST be wrapped at no more than 76 characters per line, using
 * the CRLF ("\r\n") sequence as the line delimiter. Many mail and news
 * gateways will corrupt or reject lines longer than the limit.
 *
 * Decisions baked in here — stated plainly so the tests match the code:
 *
 *   1. Input is treated as an *opaque Base64 string*. We do not validate it,
 *      re-encode it, or strip existing whitespace. We operate purely on the
 *      characters present. If the input already contains CR or LF they are
 *      passed through unchanged; it is the caller's responsibility to supply
 *      clean, unwrapped Base64.
 *   2. The chunk size is exactly 76 characters of Base64 data, counting only
 *      the data characters (A-Z, a-z, 0-9, +, /, = and any other bytes present
 *      in the string). We do not differentiate between data and padding when
 *      chunking — every input byte occupies one column.
 *   3. Lines are joined with CRLF ("\r\n"). The final line has no trailing
 *      CRLF, matching how RFC 2045 phrase breaks are applied: the delimiter
 *      separates lines, it does not terminate the body.
 *   4. Empty input produces empty output (not a stray CRLF).
 *   5. Input whose length is an exact multiple of 76 yields that many full
 *      lines with no empty trailing line.
 *
 * Why no streaming/AsyncIterable: the function is cheap and synchronous, and
 * Base64 payloads in MIME are bounded and usually modest. A streaming variant
 * would have to own buffering *and* encoding concerns, which is out of scope.
 *
 * @param {string} base64 - The Base64 string to wrap. Must be a string.
 * @returns {string} The Base64 text split into <=76-char lines joined by CRLF.
 * @throws {TypeError} If `base64` is not a string.
 */
export function wrapBase64Crlf(base64) {
  if (typeof base64 !== "string") {
    throw new TypeError(
      `wrapBase64Crlf expected a string, got ${base64 === null ? "null" : typeof base64}`,
    );
  }

  // The fast path: nothing to wrap. Returning "" here (rather than undefined)
  // keeps the return type strictly string.
  if (base64.length === 0) return "";

  const CHUNK = 76;
  const lines = [];
  for (let i = 0; i < base64.length; i += CHUNK) {
    // String.prototype.slice is safe here even when the final chunk is short;
    // it returns whatever remains without throwing.
    lines.push(base64.slice(i, i + CHUNK));
  }
  return lines.join("\r\n");
}
