import type { DataErrorSignature } from '@ports';

const toOriginError = (message: string): DataErrorSignature<never> => ({
  success: false,
  message,
  status: 400,
});

/**
 * Parse a URL string, or return a 400 envelope with the given message.
 *
 * @param value - Candidate absolute URL.
 * @param invalidMessage - Wire message when `new URL` throws.
 * @returns A URL, or an error signature.
 */
const parseUrl = (
  value: string,
  invalidMessage: string,
): URL | DataErrorSignature<never> => {
  try {
    return new URL(value);
  } catch {
    return toOriginError(invalidMessage);
  }
};

/**
 * Ensure a unit artwork URL matches the configured media origin.
 *
 * Blocks SSRF-style fetches of arbitrary hosts during card render. Empty
 * configuration is a 500 so misconfigured deploys fail closed.
 *
 * @param imageUrl - Artwork URL from the unit type.
 * @param allowedOriginValue - Allowed origin from process env.
 * @returns Success, or a 400/500 error envelope.
 */
const assertAllowedMediaOrigin = (
  imageUrl: string,
  allowedOriginValue: string,
): DataErrorSignature<never> | { success: true } => {
  if (allowedOriginValue.length === 0) {
    return {
      success: false,
      message: 'Allowed media origin is not configured',
      status: 500,
    };
  }

  const imageOrigin = parseUrl(imageUrl, 'Invalid image URL');
  if ('success' in imageOrigin) {
    return imageOrigin;
  }

  const allowedOrigin = parseUrl(
    allowedOriginValue,
    'Invalid media origin configuration',
  );
  if ('success' in allowedOrigin) {
    return allowedOrigin;
  }

  if (imageOrigin.origin !== allowedOrigin.origin) {
    return toOriginError('Image URL origin is not allowed');
  }

  if (imageOrigin.protocol !== 'https:' && imageOrigin.protocol !== 'http:') {
    return toOriginError('Image URL must use http or https');
  }

  return { success: true };
};

export { assertAllowedMediaOrigin };
