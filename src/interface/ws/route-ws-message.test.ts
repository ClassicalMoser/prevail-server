import { recordSchema, recordingLogger } from '@testing';
import { setTimeout as delay } from 'node:timers/promises';
import { createInboundHandler } from './create-inbound-handler';
import { routeWsMessage } from './route-ws-message';

// A route that takes one message type, step, and runs any record payload.
const inbound = new Map([
  [
    'step',
    createInboundHandler({
      emptyPayloadAllowed: true,
      run: async () => ({ ok: true as const }),
      schema: recordSchema,
    }),
  ],
]);

/** Route one frame and collect what was sent back. */
// Routes one raw frame and collects what the server sent back.
const route = async (raw: string): Promise<unknown[]> => {
  const sent: unknown[] = [];
  routeWsMessage({
    connectionHandle: 'handle',
    context: 'ctx',
    inbound,
    logger: recordingLogger(),
    path: '/ws/games/id/g/bot-vs-bot',
    raw,
    rejectedType: 'stepRejected',
    sendJson: (message) => sent.push(message),
  });
  await delay(10);
  return sent;
};

// The rejection frame the client should receive for a given reason.
const rejection = (errorReason: string): unknown => ({
  payload: { errorReason, result: false },
  type: 'stepRejected',
});

describe('routeWsMessage function', () => {
  it(
    'runs a known type with a valid payload and sends nothing',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // A known type with no payload: it runs, and a success sends nothing
      // back.
      await expect(route('{"type":"step"}')).resolves.toStrictEqual([]);
    },
  );

  it('refuses a frame that is not JSON', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    // The frame is not JSON.
    await expect(route('nope')).resolves.toStrictEqual([
      rejection('Invalid JSON'),
    ]);
  });

  it('refuses a type the route does not take', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    // A type that exists on every object but not on this route's map: it must
    // be refused, not looked up as a method.
    await expect(route('{"type":"toString"}')).resolves.toStrictEqual([
      rejection('Invalid inbound message'),
    ]);
  });

  it(
    'refuses a payload the contract schema refuses',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // A payload the schema refuses is named for its message type.
      await expect(route('{"type":"step","payload":5}')).resolves.toStrictEqual(
        [rejection('Invalid step')],
      );
    },
  );
});
