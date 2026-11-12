import type {
  EnginePorts,
  GameRunner,
} from '@classicalmoser/prevail-rules/application';
import { defaultRandom } from '@classicalmoser/prevail-rules/domain';
import type { GameSessionStore } from '@application';
import type { OwnedArmyStorage } from '@ports';

/**
 * Stands for armies storage in a test that never reads it; every call is an
 * unprogrammed mock.
 */
const idleArmyStorage = (): OwnedArmyStorage => ({
  archiveOwnedArmy: vi.fn(),
  createOwnedArmy: vi.fn(),
  getOwnedArmies: vi.fn(),
  getOwnedArmyById: vi.fn(),
  updateOwnedArmy: vi.fn(),
});

/** Stands for the rules runner in a test that never advances a game. */
const idleRunner = (): GameRunner => ({
  advanceUntilPlayerChoice: vi.fn(),
  handlePlayerChoiceSubmission: vi.fn(),
  requestGameStateSnapshot: vi.fn(),
  startNewGame: vi.fn(),
});

/**
 * Stands for the engine's storage in a test that never writes through it. Random
 * is the real default, so nothing seeded is faked.
 */
const idleEnginePorts = (): EnginePorts => ({
  random: defaultRandom,
  eventStreamStorage: {
    addEventToStream: vi.fn(),
    flushEventStream: vi.fn(),
    getEventStream: vi.fn(),
    newEventStream: vi.fn(),
    truncateEventStream: vi.fn(),
  },
  gameStateSubscribers: [],
  gameStorage: {
    getGame: vi.fn(),
    saveNewGame: vi.fn(),
    updateGameState: vi.fn(),
  },
  roundSnapshotStorage: {
    getRoundSnapshot: vi.fn(),
    saveRoundSnapshot: vi.fn(),
  },
});

/** Empty live-game memory. Tests replace the maps and ports they write. */
const gameSessionStore = (
  patch: Partial<GameSessionStore> = {},
): GameSessionStore => ({
  // No pause between bot turns, so tests do not wait on a timer.
  botTurnGapMs: 0,
  connections: new Map(),
  enginePorts: idleEnginePorts(),
  metaByGameId: new Map(),
  ownedArmyStorage: idleArmyStorage(),
  runner: idleRunner(),
  submitQueues: new Map(),
  watchers: new Map(),
  ...patch,
});

export { gameSessionStore };
