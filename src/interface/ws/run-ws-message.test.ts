import { setTimeout as delay } from 'node:timers/promises';
import { recordingLogger } from '@testing';
import { runWsMessage } from './run-ws-message';

const base = { path: '/ws/games/id/g/white', type: 'playerChoice' };

describe('runWsMessage function', () => {
  it('sends nothing when the handler succeeds', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const sent: unknown[] = [];
    runWsMessage({
      ...base,
      handle: async () => ({ ok: true }),
      logger: recordingLogger(),
      rejectedType: 'choiceRejected',
      sendJson: (message) => sent.push(message),
    });
    await delay(10);

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
        handle: async () => ({
          ok: false,
          rejection: { errorReason: 'Not your turn', result: false },
        }),
        logger: recordingLogger(),
        rejectedType: 'stepRejected',
        sendJson: (message) => sent.push(message),
      });
      await delay(10);

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
        throw new Error('boom');
      },
      logger,
      rejectedType: 'choiceRejected',
      sendJson: (message) => sent.push(message),
    });
    await delay(10);

    expect(logger.errors).toHaveLength(1);
    expect(sent).toStrictEqual([
      {
        payload: { errorReason: 'Internal error', result: false },
        type: 'choiceRejected',
      },
    ]);
  });
});
