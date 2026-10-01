import type {
  EnginePorts,
  GameRunner,
} from '@classicalmoser/prevail-rules/application';
import type { GameSessionStore } from '@application';
import type { OwnedArmyStorage } from '@ports';

const idleArmyStorage = (): OwnedArmyStorage => ({
  archiveOwnedArmy: vi.fn(),
  createOwnedArmy: vi.fn(),
  getOwnedArmies: vi.fn(),
  getOwnedArmyById: vi.fn(),
  updateOwnedArmy: vi.fn(),
});

const idleRunner = (): GameRunner => ({
  advanceUntilPlayerChoice: vi.fn(),
  handlePlayerChoiceSubmission: vi.fn(),
  requestGameStateSnapshot: vi.fn(),
  startNewGame: vi.fn(),
});

const idleEnginePorts = (): EnginePorts => ({
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
  botTurnGapMs: 0,
  connections: new Map(),
  enginePorts: idleEnginePorts(),
  metaByGameId: new Map(),
  ownedArmyStorage: idleArmyStorage(),
  runner: idleRunner(),
  submitQueues: new Map(),
  ...patch,
});

export { gameSessionStore };
