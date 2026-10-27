# base64-crlf-line-wrapper

Inserts RFC 2045 CRLF line breaks every 76 characters into Base64 output for MIME compatibility.

## Usage

```js
import { wrapBase64Crlf } from "base64-crlf-line-wrapper";

const b64 = Buffer.from("a fairly long payload ...").toString("base64");
const mimeBody = wrapBase64Crlf(b64);
// mimeBody is now split into lines of <=76 chars separated by CRLF.
```

The library exports exactly one name: `wrapBase64Crlf`. It is a synchronous function
that takes a string and returns a string.

## Why this exists

MIME (RFC 2045) mandates that Base64 bodies be wrapped at no more than 76
characters per line using CRLF as the delimiter. Mail and news gateways have
historically mangled lines longer than the limit, so producing compliant output
up front is safer than hoping the transport will reflow it.

The trade-off taken here: `wrapBase64Crlf` treats its input as an **opaque
Base64 string**. It does not validate the alphabet, re-encode, or strip
existing whitespace. If your input already contains CR or LF characters they
are passed through untouched; the function is meant to sit between a real
Base64 encoder and the wire, not to clean up arbitrary text.

Lines are joined with CRLF; the final line has no trailing CRLF. Empty input
returns empty output.

## Edge cases

- Input whose length is an exact multiple of 76 produces that many full lines
  with no empty trailing line.
- A trailing `=` padding character that lands one column past a 76-column
  boundary becomes its own short final line — this is correct and matches what
  most MIME encoders emit.
- Non-string input throws `TypeError`. There is no implicit coercion.

## Running the tests

```
node --test
```
