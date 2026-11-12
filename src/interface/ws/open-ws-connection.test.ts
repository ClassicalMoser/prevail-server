import { recordingLogger } from '@testing';
import { openWsConnection } from './open-ws-connection';

describe('openWsConnection function', () => {
  it(
    'passes through the handle the open handler kept',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const result = await openWsConnection({
        logger: recordingLogger(),
        // The open handler admits the client and keeps a handle for it.
        open: async () => ({ connectionHandle: 'kept', ok: true }),
        path: '/ws/games/id/g/white',
      });

      // The handle is passed through for later close handling.
      expect(result).toStrictEqual({ connectionHandle: 'kept', ok: true });
    },
  );

  it(
    'closes with 1011 and logs when the open handler throws',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const logger = recordingLogger();
      const result = await openWsConnection({
        logger,
        open: async () => {
          // A thrown error stands for an outage while opening the game.
          throw new Error('store down');
        },
        path: '/ws/games/id/g/white',
      });

      expect(result).toStrictEqual({
        // 1011 is the internal-error close code, and the reason shows no detail
        // to the client.
        closeCode: 1011,
        ok: false,
        reason: 'Internal error',
      });
      // The real cause is logged once for the operator.
      expect(logger.errors).toHaveLength(1);
    },
  );
});
