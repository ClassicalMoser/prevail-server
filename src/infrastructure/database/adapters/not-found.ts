import type { DataErrorSignature } from '@ports';

/**
 * Build a 404 storage failure with a caller-supplied message.
 *
 * @param message - Human-readable reason the row was missing.
 * @returns An error signature with status 404.
 */
const notFound = (message: string): DataErrorSignature<never> => ({
  success: false,
  message,
  status: 404,
});

export { notFound };
