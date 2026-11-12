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
        open: async () => ({ connectionHandle: 'kept', ok: true }),
        path: '/ws/games/id/g/white',
      });

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
          throw new Error('store down');
        },
        path: '/ws/games/id/g/white',
      });

      expect(result).toStrictEqual({
        closeCode: 1011,
        ok: false,
        reason: 'Internal error',
      });
      expect(logger.errors).toHaveLength(1);
    },
  );
});
