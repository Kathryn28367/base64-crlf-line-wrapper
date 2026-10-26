/**
 * Public entry point for base64-crlf-line-wrapper.
 *
 * Re-exports the MIME line-wrapping routine so callers can import a single
 * named symbol without reaching into internal modules.
 */
export { wrapBase64Crlf } from "./core.js";
