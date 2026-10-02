import type { LoggerPort } from '@ports';
import { notFound, storageOp, voidSuccess } from './storage-op';

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

describe('notFound function', () => {
  it(
    'builds a 404 envelope with the message this test set',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const result = notFound('Army not found');

      expect(result).toStrictEqual({
        message: 'Army not found',
        status: 404,
        success: false,
      });
    },
  );
});

describe('voidSuccess function', () => {
  it('builds a successful void envelope', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const result = voidSuccess();

    expect(result).toStrictEqual({ data: undefined, success: true });
  });
});
