import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import { whiteInGameWsContract } from '@classicalmoser/prevail-contracts';
import type { InGameSeatWsHandler } from '@ports';
import { implementInGameSeatWs } from './implement-in-game-seat-ws';
import { recordingLogger } from '@testing';

const logger = recordingLogger();

// A well-formed game id, which the contract's params accept.
const validGameId = '550e8400-e29b-41d4-a716-446655440000';

type SeatHandlers = InGameSeatWsHandler<{ gameId: string }, unknown>;

// Handlers that all succeed; a case overrides only the one it checks.
const stubHandlers = (overrides?: {
  onRequestGameSnapshot?: SeatHandlers['onRequestGameSnapshot'];
  onPlayerChoice?: SeatHandlers['onPlayerChoice'];
}): SeatHandlers => ({
  onClose: (): void => {
    /* Unused */
  },
  onOpen: async (): Promise<{
    connectionHandle: { id: string };
    ok: true;
  }> => ({ connectionHandle: { id: 'conn' }, ok: true }),
  onPlayerChoice:
    overrides?.onPlayerChoice ??
    (async (): Promise<{ ok: true }> => ({ ok: true })),
  onRequestGameSnapshot:
    overrides?.onRequestGameSnapshot ??
    (async (): Promise<{ ok: true }> => ({ ok: true })),
});

describe('in-game seat WS implement helper', () => {
  it('rejects invalid params on connection', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const route = implementInGameSeatWs(
      whiteInGameWsContract,
      logger,
      stubHandlers(),
    );

    let closeCode = -1;
    await route.onConnection(
      {
        auth: { subject: 'sub' },
        headers: {},
        // A game id that is not a uuid.
        params: { gameId: 'not-a-uuid' },
      },
      {
        close: (code = -1): void => {
          closeCode = code;
        },
        onClose: (): void => {
          /* Unused */
        },
        onMessage: (): void => {
          /* Unused */
        },
        send: (): void => {
          /* Unused */
        },
      },
    );

    // A bad game id is closed with 1008, the policy-violation code.
    expect(closeCode).toBe(1008);
  });

  it(
    'sends choiceRejected for invalid inbound JSON',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const route = implementInGameSeatWs(
        whiteInGameWsContract,
        logger,
        stubHandlers(),
      );

      // The fake socket records what the server sends.
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
          close: (): void => {
            /* Unused */
          },
          onClose: (): void => {
            /* Unused */
          },
          onMessage: (handler): void => {
            handlers.current = handler;
          },
          send: (data): void => {
            sent.push(data);
          },
        },
      );

      expect(handlers.current).toBeTypeOf('function');
      assert.ok(handlers.current !== undefined);
      // The player sends text that is not JSON.
      handlers.current('not-json');
      assert.ok(sent[0] !== undefined);

      // A seat is told its choice was rejected, by the type the white contract
      // names.
      expect(JSON.parse(sent[0])).toStrictEqual({
        payload: { errorReason: 'Invalid JSON', result: false },
        type: 'choiceRejected',
      });
    },
  );

  it(
    'routes requestGameSnapshot to the seat handler',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The snapshot handler counts its calls.
      let snapshotCalls = 0;
      const route = implementInGameSeatWs(
        whiteInGameWsContract,
        logger,
        stubHandlers({
          onRequestGameSnapshot: async (): Promise<{ ok: true }> => {
            snapshotCalls += 1;
            return { ok: true };
          },
        }),
      );

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
          close: (): void => {
            /* Unused */
          },
          onClose: (): void => {
            /* Unused */
          },
          onMessage: (handler): void => {
            handlers.current = handler;
          },
          send: (): void => {
            /* Unused */
          },
        },
      );

      assert.ok(handlers.current !== undefined);
      handlers.current(
        // A seat asks for the current game state, as on reconnect.
        JSON.stringify({ payload: {}, type: 'requestGameSnapshot' }),
      );

      // The handler runs after the message is read, so the test waits briefly.
      await delay(10);

      // The request reached the seat's snapshot handler.
      expect(snapshotCalls).toBe(1);
    },
  );
});
