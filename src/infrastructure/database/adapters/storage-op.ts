import type { DataErrorSignature, LoggerPort } from '@ports';
import { handleError } from '@utils';

interface StorageOpInput<T> {
  logger: LoggerPort;
  context: string;
  message: string;
  run: () => Promise<DataErrorSignature<T>>;
}

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

const notFound = (message: string): DataErrorSignature<never> => ({
  success: false,
  message,
  status: 404,
});

const voidSuccess = (): DataErrorSignature<void> => ({
  success: true,
  data: undefined,
});

export type { StorageOpInput };
export { notFound, storageOp, voidSuccess };
