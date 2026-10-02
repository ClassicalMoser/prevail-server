import { setTimeout as delay } from 'node:timers/promises';
import { runDetached } from './run-detached';

describe('runDetached function', () => {
  it(
    'runs the task without rejecting the caller when it fails',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      let finished = false;
      runDetached(async () => {
        finished = true;
        throw new Error('detached failure');
      });

      await delay(20);

      expect(finished).toBe(true);
    },
  );
});
