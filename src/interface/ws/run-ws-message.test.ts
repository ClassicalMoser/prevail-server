import { setTimeout as delay } from 'node:timers/promises';
import { recordingLogger } from '@testing';
import { runWsMessage } from './run-ws-message';

// The route path and message type shared by every case.
const base = { path: '/ws/games/id/g/white', type: 'playerChoice' };

describe('runWsMessage function', () => {
  it('sends nothing when the handler succeeds', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const sent: unknown[] = [];
    runWsMessage({
      ...base,
      // The handler accepts the message.
      handle: async () => ({ ok: true }),
      logger: recordingLogger(),
      rejectedType: 'choiceRejected',
      sendJson: (message) => sent.push(message),
    });
    await delay(10);

    // A success is silent; the client learns the outcome through game events
    // instead.
    expect(sent).toStrictEqual([]);
  });

  it(
    'sends the refusal under the route rejection type',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const sent: unknown[] = [];
      runWsMessage({
        ...base,
        // The handler refuses the message, as when it is not that player's
        // turn.
        handle: async () => ({
          ok: false,
          rejection: { errorReason: 'Not your turn', result: false },
        }),
        logger: recordingLogger(),
        // The route's own rejection type is used, here stepRejected.
        rejectedType: 'stepRejected',
        sendJson: (message) => sent.push(message),
      });
      await delay(10);

      // The refusal reaches the client under the route's rejection type with
      // the handler's reason.
      expect(sent).toStrictEqual([
        {
          payload: { errorReason: 'Not your turn', result: false },
          type: 'stepRejected',
        },
      ]);
    },
  );

  it('logs a throw and answers Internal error', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const sent: unknown[] = [];
    const logger = recordingLogger();
    runWsMessage({
      ...base,
      handle: async () => {
        // A handler that throws is a server fault.
        throw new Error('boom');
      },
      logger,
      rejectedType: 'choiceRejected',
      sendJson: (message) => sent.push(message),
    });
    await delay(10);

    // The error is logged.
    expect(logger.errors).toHaveLength(1);
    // The client gets only 'Internal error', never the thrown text.
    expect(sent).toStrictEqual([
      {
        payload: { errorReason: 'Internal error', result: false },
        type: 'choiceRejected',
      },
    ]);
  });
});
