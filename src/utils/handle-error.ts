import type { ErrorSignature, LoggerPort } from '@ports';

interface ErrorHandler {
  error: unknown;
  logger: LoggerPort;
  context: string;
  message: string;
  status: number;
}

/**
 * Log a thrown value and return a stable error envelope for the caller.
 *
 * Real `Error` stacks are preferred. Anything else is stringified with the
 * caller's context phrase so the log still says what was in flight.
 *
 * @param handler - Thrown value, logger, context phrase, and wire message/status.
 * @returns An {@link ErrorSignature} with the given message and status.
 */
const handleError = (handler: ErrorHandler): ErrorSignature => {
  const { error, logger, context, message, status } = handler;
  if (error instanceof Error) {
    logger.error(error.stack ?? error.message);
  } else {
    const stringError = String(error);
    logger.error(`Unknown error while ${context}: ${stringError}`);
  }
  // The message is fixed by the caller and the thrown text stays in the log, so a
  // client never reads an internal error.
  return {
    success: false,
    message,
    status,
  };
};

export { handleError };
export type { ErrorHandler };
