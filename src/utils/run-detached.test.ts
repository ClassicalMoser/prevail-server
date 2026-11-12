import { setTimeout as delay } from 'node:timers/promises';
import { runDetached } from './run-detached';

describe('runDetached function', () => {
  it(
    'runs the task without rejecting the caller when it fails',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The task records that it ran before it throws.
      let finished = false;
      // The task throws, and the caller does not await it: a background failure
      // must not become an unhandled rejection.
      runDetached(async () => {
        finished = true;
        throw new Error('detached failure');
      });

      // A short wait lets the detached task run.
      await delay(20);

      // The task ran and the test is still standing: the caller was not
      // rejected.
      expect(finished).toBe(true);
    },
  );
});
