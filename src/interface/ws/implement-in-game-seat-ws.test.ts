import { whiteInGameWsContract } from '@classicalmoser/prevail-contracts';
import type { LoggerPort } from '@ports';
import { implementInGameSeatWs } from './implement-in-game-seat-ws';

const logger: LoggerPort = {
  error: () => {
    /* Test stub */
  },
  info: () => {
    /* Test stub */
  },
  warn: () => {
    /* Test stub */
  },
};

const validGameId = '550e8400-e29b-41d4-a716-446655440000';

describe('in-game seat WS implement helper', () => {
  it(
    'rejects invalid params on connection',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const route = implementInGameSeatWs(whiteInGameWsContract, logger, {
        onClose: () => {
          /* Unused */
        },
        onOpen: async () => ({ connectionHandle: undefined, ok: true }),
        onPlayerChoice: async () => ({ ok: true }),
      });

      let closeCode = -1;
      await route.onConnection(
        {
          auth: { subject: 'sub' },
          headers: {},
          params: { gameId: 'not-a-uuid' },
        },
        {
          close: (code = -1) => {
            closeCode = code;
          },
          onClose: () => {
            /* Unused */
          },
          onMessage: () => {
            /* Unused */
          },
          send: () => {
            /* Unused */
          },
        },
      );

      expect(closeCode).toBe(1008);
    },
  );

  it(
    'sends choiceRejected for invalid inbound JSON',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const route = implementInGameSeatWs(whiteInGameWsContract, logger, {
        onClose: () => {
          /* Unused */
        },
        onOpen: async () => ({ connectionHandle: undefined, ok: true }),
        onPlayerChoice: async () => ({ ok: true }),
      });

      const sent: string[] = [];
      const handlers: { current: ((raw: string) => void) | undefined } = {
        current: undefined,
      };

      await route.onConnection(
        {
          auth: { subject: 'sub' },
          headers: {},
          params: { gameId: validGameId },
        },
        {
          close: () => {
            /* Unused */
          },
          onClose: () => {
            /* Unused */
          },
          onMessage: (handler) => {
            handlers.current = handler;
          },
          send: (data) => {
            sent.push(data);
          },
        },
      );

      expect(handlers.current).toBeTypeOf('function');
      handlers.current?.('not-json');

      expect(JSON.parse(sent[0] ?? '{}')).toStrictEqual({
        payload: { errorReason: 'Invalid JSON', result: false },
        type: 'choiceRejected',
      });
    },
  );
});
