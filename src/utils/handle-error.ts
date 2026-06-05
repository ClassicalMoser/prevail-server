import type { ErrorSignature, LoggerPort } from '@ports';

interface ErrorHandler {
  error: unknown;
  logger: LoggerPort;
  context: string;
  message: string;
  status: number;
}

const handleError = (handler: ErrorHandler): ErrorSignature => {
  const { error, logger, context, message, status } = handler;
  if (error instanceof Error) {
    logger.error(error.stack ?? error.message);
  } else {
    const stringError = String(error);
    logger.error(`Unknown error while ${context}: ${stringError}`);
  }
  return {
    success: false,
    message,
    status,
  };
};

export { handleError };
export type { ErrorHandler };
