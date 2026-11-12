import type {
  EnginePorts,
  createGameRunner,
} from '@classicalmoser/prevail-rules/application';
import type {
  GameSeatConnection,
  GameWatchConnection,
  OwnedArmyStorage,
} from '@ports';
import type { GameSessionMeta } from './game-session-meta';

type GameRunner = ReturnType<typeof createGameRunner>;

/**
 * Mutable process memory for one server's live games.
 *
 * Maps are created once when the use cases are built. Each session operation
 * receives this store instead of closing over the factory.
 */
interface GameSessionStore {
  /** Who may open a game and what kind it is; a game with no entry is not hosted here. */
  metaByGameId: Map<string, GameSessionMeta>;
  /** Open seat sockets per human-vs-bot game; fanout sends each its own projected view. */
  connections: Map<string, Set<GameSeatConnection>>;
  /** Sockets watching a bot-vs-bot game. They get authoritative messages. */
  watchers: Map<string, Set<GameWatchConnection>>;
  /** The tail of each game's job chain; `enqueue` appends to it so one game's jobs never overlap. */
  submitQueues: Map<string, Promise<unknown>>;
  /** The rules engine's runner: the only judge of a choice and the only thing that applies effects. */
  runner: GameRunner;
  /** Where the engine keeps games and event streams; its write hooks drive fanout. */
  enginePorts: EnginePorts;
  /** Where a creator's saved armies are read when a game is created. */
  ownedArmyStorage: OwnedArmyStorage;
  /** Pause between consecutive bot submits so a human can follow the bot's moves. */
  botTurnGapMs: number;
}

export type { GameSessionStore };
