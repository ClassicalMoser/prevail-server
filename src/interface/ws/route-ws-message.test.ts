import { recordSchema, recordingLogger } from '@testing';
import { setTimeout as delay } from 'node:timers/promises';
import { createInboundHandler } from './create-inbound-handler';
import { routeWsMessage } from './route-ws-message';

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

      await expect(route('{"type":"step"}')).resolves.toStrictEqual([]);
    },
  );

  it('refuses a frame that is not JSON', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    await expect(route('nope')).resolves.toStrictEqual([
      rejection('Invalid JSON'),
    ]);
  });

  it('refuses a type the route does not take', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    await expect(route('{"type":"toString"}')).resolves.toStrictEqual([
      rejection('Invalid inbound message'),
    ]);
  });

  it(
    'refuses a payload the contract schema refuses',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      await expect(route('{"type":"step","payload":5}')).resolves.toStrictEqual(
        [rejection('Invalid step')],
      );
    },
  );
});
