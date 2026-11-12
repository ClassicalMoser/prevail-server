import { storageOp } from './storage-op';
import { recordingLogger } from '@testing';

const logger = recordingLogger();

describe('storageOp function', () => {
  it('returns the run result when it succeeds', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    // A run that succeeds passes its envelope through untouched.
    const result = await storageOp({
      context: 'reading',
      logger,
      message: 'Failed to read',
      run: async () => ({ data: 1, success: true }),
    });

    // The result is the run's own envelope, not wrapped again.
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
        // A thrown driver error stands for a database failure: the port must
        // answer with an envelope, not throw.
        run: async () => {
          throw new Error('boom');
        },
      });

      // The caller's fixed message with status 500 comes back; the thrown
      // error's text stays out of the response.
      expect(result).toStrictEqual({
        message: 'Failed to read',
        status: 500,
        success: false,
      });
    },
  );
});
