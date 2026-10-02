import type { LoggerPort } from '@ports';
import { storageOp } from './storage-op';

const logger: LoggerPort = {
  error: (): void => {
    /* unused unless run throws */
  },
  info: (): void => {
    /* unused unless run throws */
  },
  warn: (): void => {
    /* unused unless run throws */
  },
};

describe('storageOp function', () => {
  it('returns the run result when it succeeds', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const result = await storageOp({
      context: 'reading',
      logger,
      message: 'Failed to read',
      run: async () => ({ data: 1, success: true }),
    });

    expect(result).toStrictEqual({ data: 1, success: true });
  });

  it(
    'turns a thrown error into a 500 envelope',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const result = await storageOp({
        context: 'reading',
        logger,
        message: 'Failed to read',
        run: async () => {
          throw new Error('boom');
        },
      });

      expect(result).toStrictEqual({
        message: 'Failed to read',
        status: 500,
        success: false,
      });
    },
  );
});
