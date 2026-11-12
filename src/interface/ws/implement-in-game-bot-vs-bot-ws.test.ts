import assert from 'node:assert/strict';
import { setTimeout as delay } from 'node:timers/promises';
import { botVsBotInGameWsContract } from '@classicalmoser/prevail-contracts';
import type { InGameBotVsBotWsHandler, LoggerPort } from '@ports';
import { implementInGameBotVsBotWs } from './implement-in-game-bot-vs-bot-ws';

const logger: LoggerPort = {
  error: (): void => {
    /* Test stub */
  },
  info: (): void => {
    /* Test stub */
  },
  warn: (): void => {
    /* Test stub */
  },
};

const validGameId = '550e8400-e29b-41d4-a716-446655440000';

type WatchHandlers = InGameBotVsBotWsHandler<{ gameId: string }, unknown>;

const stubHandlers = (overrides?: {
  onStep?: WatchHandlers['onStep'];
}): WatchHandlers => ({
  onClose: (): void => {
    /* Unused */
  },
  onOpen: async (): Promise<{
    connectionHandle: { id: string };
    ok: true;
  }> => ({ connectionHandle: { id: 'conn' }, ok: true }),
  onRequestGameSnapshot: async (): Promise<{ ok: true }> => ({ ok: true }),
  onStep:
    overrides?.onStep ?? (async (): Promise<{ ok: true }> => ({ ok: true })),
});

/**
 * Open the route on a fake socket.
 *
 * @param handlers - Watcher handlers under test.
 * @returns What the socket sent, and its message handler.
 */
const openSocket = async (
  handlers: WatchHandlers,
): Promise<{ sent: string[]; receive: (raw: string) => void }> => {
  const route = implementInGameBotVsBotWs(
    botVsBotInGameWsContract,
    logger,
    handlers,
  );
  const sent: string[] = [];
  const received: { current?: (raw: string) => void } = {};
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
        received.current = handler;
      },
      send: (data): void => {
        sent.push(data);
      },
    },
  );
  assert.ok(received.current !== undefined);
  const socket = { receive: received.current, sent };
  return socket;
};

describe('bot-vs-bot WS implement helper', () => {
  it('routes step to the step handler', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    let steps = 0;
    const { receive } = await openSocket(
      stubHandlers({
        onStep: async (): Promise<{ ok: true }> => {
          steps += 1;
          return { ok: true };
        },
      }),
    );

    receive('{"type":"step","payload":{}}');
    await delay(0);

    expect(steps).toBe(1);
  });

  it(
    'sends stepRejected when the step handler refuses',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const { receive, sent } = await openSocket(
        stubHandlers({
          onStep: async () => ({
            ok: false,
            stepRejected: { errorReason: 'The game is over', result: false },
          }),
        }),
      );

      receive('{"type":"step","payload":{}}');
      await delay(0);
      assert.ok(sent[0] !== undefined);

      expect(JSON.parse(sent[0])).toStrictEqual({
        payload: { errorReason: 'The game is over', result: false },
        type: 'stepRejected',
      });
    },
  );

  it(
    'sends stepRejected for a message type the contract lacks',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const { receive, sent } = await openSocket(stubHandlers());

      receive('{"type":"playerChoice","payload":{}}');
      assert.ok(sent[0] !== undefined);

      expect(JSON.parse(sent[0])).toStrictEqual({
        payload: { errorReason: 'Invalid inbound message', result: false },
        type: 'stepRejected',
      });
    },
  );
});
