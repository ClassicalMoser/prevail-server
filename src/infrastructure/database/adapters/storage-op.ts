import type { DataErrorSignature, LoggerPort } from '@ports';
import { handleError } from '@utils';

interface StorageOpInput<T> {
  logger: LoggerPort;
  context: string;
  message: string;
  run: () => Promise<DataErrorSignature<T>>;
}

/**
 * Run a storage callback and turn unexpected throws into a 500 envelope.
 *
 * Domain failures that already return `success: false` pass through. Only
 * thrown errors (driver crashes, programming mistakes) hit `handleError`.
 *
 * @param input - Logger, context phrase, wire message, and async work.
 * @returns The callback result, or a 500 error signature.
 */
const storageOp = async <T>(
  input: StorageOpInput<T>,
): Promise<DataErrorSignature<T>> => {
  try {
    return await input.run();
  } catch (error) {
    return handleError({
      error,
      logger: input.logger,
      context: input.context,
      message: input.message,
      status: 500,
    });
  }
};

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

/**
 * Build a void data success for writes that return no payload.
 *
 * @returns `{ success: true, data: undefined }`.
 */
const voidSuccess = (): DataErrorSignature<void> => ({
  success: true,
  data: undefined,
});

export type { StorageOpInput };
export { notFound, storageOp, voidSuccess };
