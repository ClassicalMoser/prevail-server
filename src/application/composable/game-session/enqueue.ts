import type { GameSessionStore } from './game-session-store';

/**
 * Run work for one game after that game's previous job finishes.
 *
 * A failed prior job does not block the queue. Submit, create, and seat
 * registration share this queue so a bot turn and a human submit cannot overlap.
 *
 * @param store - Live-game memory.
 * @param gameId - Game whose queue should run the work.
 * @param work - Job to run once the previous job settles.
 * @returns The job's result.
 */
const enqueue = async <T>(
  store: GameSessionStore,
  gameId: string,
  work: () => Promise<T>,
): Promise<T> => {
  const previous = store.submitQueues.get(gameId) ?? Promise.resolve();
  const run = (async (): Promise<T> => {
    try {
      await previous;
    } catch {
      // Keep the per-game queue moving after a prior failure.
    }
    return work();
  })();
  store.submitQueues.set(gameId, run);
  return run;
};

export { enqueue };
