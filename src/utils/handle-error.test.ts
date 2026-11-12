import type { LoggerPort } from '@ports';
import { handleError } from './handle-error';

describe('handleError function', () => {
  it(
    'logs an Error stack and returns the failure envelope',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // The logger records error messages so the test can see what the operator
      // would read.
      const logged: string[] = [];
      const logger: LoggerPort = {
        error: (message): void => {
          logged.push(message);
        },
        info: (): void => {
          /* unused in this test */
        },
        warn: (): void => {
          /* unused in this test */
        },
      };

      // A thrown Error with the message 'boom'.
      const result = handleError({
        context: 'saving',
        error: new Error('boom'),
        logger,
        message: 'Failed to save',
        status: 500,
      });

      // The caller gets the safe message and status, not the error text.
      expect(result).toStrictEqual({
        message: 'Failed to save',
        status: 500,
        success: false,
      });
      // The log keeps the error's own text for the operator.
      expect(logged[0]).toContain('boom');
    },
  );

  it(
    'logs a string form when the thrown value is not an Error',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // Same recording logger.
      const logged: string[] = [];
      const logger: LoggerPort = {
        error: (message): void => {
          logged.push(message);
        },
        info: (): void => {
          /* unused in this test */
        },
        warn: (): void => {
          /* unused in this test */
        },
      };

      // Something other than an Error was thrown, a bare string.
      const result = handleError({
        context: 'saving',
        error: 'raw',
        logger,
        message: 'Failed to save',
        status: 500,
      });

      // The failure envelope is returned all the same.
      expect(result.success).toBe(false);
      // The log line names the context ('saving') and the string.
      expect(logged).toStrictEqual(['Unknown error while saving: raw']);
    },
  );
});
