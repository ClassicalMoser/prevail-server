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
    const failure = handleError({
      error,
      logger: input.logger,
      context: input.context,
      message: input.message,
      status: 500,
    });
    return failure;
  }
};

export type { StorageOpInput };
export { storageOp };
