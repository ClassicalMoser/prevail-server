import { gameIdParamsSchema, recordSchema, recordingLogger } from '@testing';
import { setTimeout as delay } from 'node:timers/promises';
import { createInboundHandler } from './create-inbound-handler';
import { implementWsRoute } from './implement-ws-route';
import type { WsSocket } from './ws-types';

/** A socket whose handlers the test can fire. */
const fakeSocket = (): {
  socket: WsSocket;
  sent: string[];
  closed: unknown[];
  fireMessage: (raw: string) => void;
  fireClose: () => void;
} => {
  const sent: string[] = [];
  const closed: unknown[] = [];
  const handlers: { message: (raw: string) => void; close: () => void } = {
    close: () => {
      /* Unused until the route registers it. */
    },
    message: () => {
      /* Unused until the route registers it. */
    },
  };
  const socket: WsSocket = {
    close: (code, reason) => closed.push([code, reason]),
    onClose: (handler) => {
      handlers.close = handler;
    },
    onMessage: (handler) => {
      handlers.message = handler;
    },
    send: (data) => sent.push(data),
  };
  return {
    closed,
    fireClose: () => handlers.close(),
    fireMessage: (raw) => handlers.message(raw),
    sent,
    socket,
  };
};

const wire = {
  auth: { subject: 'auth0|a' },
  headers: {},
  params: { gameId: 'g' },
};

const buildRoute = (overrides: {
  open?: () => Promise<
    { ok: true; connectionHandle: string } | { ok: false; reason: string }
  >;
  close?: () => void;
}): ReturnType<typeof implementWsRoute> =>
  implementWsRoute({
    auth: { authRequired: true, permissionsRequired: [] },
    buildContext: (admitted) => admitted.params.gameId,
    close: overrides.close ?? ((): void => undefined),
    inbound: new Map([
      [
        'step',
        createInboundHandler({
          emptyPayloadAllowed: true,
          run: async () => ({ ok: true as const }),
          schema: recordSchema,
        }),
      ],
    ]),
    logger: recordingLogger(),
    open:
      overrides.open ??
      (async () => ({ connectionHandle: 'h', ok: true as const })),
    paramsSchema: gameIdParamsSchema,
    path: '/ws/games/id/:gameId/bot-vs-bot',
    rejectedType: 'stepRejected',
  });

describe('implementWsRoute function', () => {
  it(
    "closes with the open handler's reason when it refuses",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const { socket, closed } = fakeSocket();
      const route = buildRoute({
        open: async () => ({ ok: false, reason: 'Forbidden' }),
      });
      await route.onConnection(wire, socket);

      expect(closed).toStrictEqual([[1008, 'Forbidden']]);
    },
  );

  it(
    'answers a bad frame with the route rejection',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const { socket, sent, fireMessage } = fakeSocket();
      await buildRoute({}).onConnection(wire, socket);
      fireMessage('nope');
      await delay(10);

      expect(JSON.parse(String(sent[0]))).toStrictEqual({
        payload: { errorReason: 'Invalid JSON', result: false },
        type: 'stepRejected',
      });
    },
  );

  it('tells the game when the socket closes', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const closedFor: unknown[] = [];
    const { socket, fireClose } = fakeSocket();
    const route = buildRoute({ close: () => closedFor.push('left') });
    await route.onConnection(wire, socket);
    fireClose();

    expect(closedFor).toStrictEqual(['left']);
  });
});
