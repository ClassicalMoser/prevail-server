import type { DataErrorSignature } from '@ports';

const toOriginError = (message: string): DataErrorSignature<never> => ({
  success: false,
  message,
  status: 400,
});

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
