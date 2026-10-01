import type {
  EnginePorts,
  createGameRunner,
} from '@classicalmoser/prevail-rules/application';
import type { GameSeatConnection, OwnedArmyStorage } from '@ports';
import type { GameSessionMeta } from './game-session-meta';

type GameRunner = ReturnType<typeof createGameRunner>;

/**
 * Mutable process memory for one server's live games.
 *
 * Maps are created once when the use cases are built. Each session operation
 * receives this store instead of closing over the factory.
 */
interface GameSessionStore {
  metaByGameId: Map<string, GameSessionMeta>;
  connections: Map<string, Set<GameSeatConnection>>;
  submitQueues: Map<string, Promise<unknown>>;
  runner: GameRunner;
  enginePorts: EnginePorts;
  ownedArmyStorage: OwnedArmyStorage;
  botTurnGapMs: number;
}

export type { GameSessionStore };
