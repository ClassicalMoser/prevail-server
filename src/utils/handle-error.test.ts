import type { LoggerPort } from '@ports';
import { handleError } from './handle-error';

describe('handleError function', () => {
  it(
    'logs an Error stack and returns the failure envelope',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

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

      const result = handleError({
        context: 'saving',
        error: new Error('boom'),
        logger,
        message: 'Failed to save',
        status: 500,
      });

      expect(result).toStrictEqual({
        message: 'Failed to save',
        status: 500,
        success: false,
      });
      expect(logged[0]).toContain('boom');
    },
  );

  it(
    'logs a string form when the thrown value is not an Error',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

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

      const result = handleError({
        context: 'saving',
        error: 'raw',
        logger,
        message: 'Failed to save',
        status: 500,
      });

      expect(result.success).toBe(false);
      expect(logged).toStrictEqual(['Unknown error while saving: raw']);
    },
  );
});
