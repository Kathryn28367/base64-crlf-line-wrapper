import { test } from "node:test";
import assert from "node:assert/strict";

import { wrapBase64Crlf } from "../src/index.js";

/** 76 A's — exactly one full line, no trailing CRLF. */
const EXACT_76 = "A".repeat(76);
/** 152 A's — exactly two full lines, no trailing CRLF. */
const EXACT_152 = "A".repeat(152);
/** 77 A's — one full line plus a 1-char second line. */
const ONE_OVER = "A".repeat(77);

const CRLF = "\r\n";

test("empty input yields empty output", () => {
  assert.equal(wrapBase64Crlf(""), "");
});

test("short input under 76 is returned unchanged", () => {
  const s = "SGVsbG8=";
  assert.equal(wrapBase64Crlf(s), s);
});

test("exactly 76 chars produces a single line with no trailing CRLF", () => {
  assert.equal(wrapBase64Crlf(EXACT_76), EXACT_76);
});

test("exactly 152 chars produces two lines joined by CRLF", () => {
  assert.equal(wrapBase64Crlf(EXACT_152), `${EXACT_76}${CRLF}${EXACT_76}`);
});

test("77 chars splits into 76 + 1", () => {
  assert.equal(wrapBase64Crlf(ONE_OVER), `${EXACT_76}${CRLF}A`);
});

test("a realistic Base64 blob wraps at 76", () => {
  // 300 bytes of pseudo-random-looking Base64 text.
  const blob =
    "TU9TQ0hfU1RBVFVTX0FORF9DT01NSVRNRU5UU19BVFRFTlRJT05fUkVRVUkTVNQUk9KRUNUU19BTkRfU0VSVklDRVNfSU5fTUVNT1JZX09GX0RBUkxZX0FORF9HVU5OREVSX1NFUlZJQ0VTX1RSQU5TQ0VORElOR19USEVfTkVUV09SS19EQVRBQkFTRV9JTl9USU1FX0FORF9TUEFDRV9BTERPX0lOX1NPX0ZBUg==";
  const wrapped = wrapBase64Crlf(blob);

  const parts = wrapped.split(CRLF);
  // Every line except the last must be exactly 76 chars.
  for (let i = 0; i < parts.length - 1; i += 1) {
    assert.equal(parts[i].length, 76, `line ${i} is not 76 chars`);
  }
  // Last line is <= 76.
  assert.ok(parts[parts.length - 1].length <= 76, "last line exceeds 76");
  // Round-trip: stripping CRLF gives back the original blob.
  assert.equal(wrapped.split(CRLF).join(""), blob);
});

test("padding-only fragment at a line boundary is handled", () => {
  // 76 data chars followed by "=" — typical when source bytes align so the
  // Base64 tail lands right at the boundary.
  const withPad = `${EXACT_76}=`;
  assert.equal(wrapBase64Crlf(withPad), `${EXACT_76}${CRLF}=`);
});

test("rejects non-string input", () => {
  assert.throws(
    () => wrapBase64Crlf(42),
    (err) => err instanceof TypeError && /expected a string/.test(err.message),
  );
  assert.throws(() => wrapBase64Crlf(null), TypeError);
  assert.throws(() => wrapBase64Crlf(undefined), TypeError);
});
