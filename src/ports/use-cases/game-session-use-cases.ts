import type {
  CreateBotVsBotGameBody,
  CreateVsBotGameBody,
} from '@classicalmoser/prevail-contracts';
import type {
  FailValidationResult,
  PlayerChoiceEvent,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports/data-error-signature-port';

/** Outbound payload delivered to a connected seat socket. */
type GameSessionOutbound =
  | { type: 'playerChoice'; payload: unknown }
  | { type: 'gameEffect'; payload: unknown }
  | { type: 'gameSnapshot'; payload: unknown }
  | { type: 'choiceRejected'; payload: FailValidationResult };

/** Seat socket handle registered with the session fanout. */
interface GameSeatConnection {
  gameId: string;
  side: PlayerSide;
  subject: string;
  send: (message: GameSessionOutbound) => void;
}

/**
 * Outbound payload delivered to a socket watching a bot-vs-bot game.
 *
 * Nothing is projected: both seats are bots, so the watcher sees the
 * authoritative events and state.
 */
type GameWatchOutbound =
  | { type: 'playerChoice'; payload: unknown }
  | { type: 'gameEffect'; payload: unknown }
  | { type: 'gameSnapshot'; payload: unknown }
  | { type: 'stepRejected'; payload: FailValidationResult };

/** Socket handle watching a bot-vs-bot game. It has no seat. */
interface GameWatchConnection {
  gameId: string;
  subject: string;
  send: (message: GameWatchOutbound) => void;
}

interface GameSessionUseCasesPort {
  /** Creates a human-vs-bot game; returns the new game id. */
  createVsBotGame: (
    subject: string,
    body: CreateVsBotGameBody,
  ) => Promise<DataErrorSignature<string>>;
  /** Creates a bot-vs-bot game; returns the new game id. */
  createBotVsBotGame: (
    subject: string,
    body: CreateBotVsBotGameBody,
  ) => Promise<DataErrorSignature<string>>;
  /**
   * Registers the creator's bot-vs-bot socket for authoritative fanout and
   * sends its current `gameSnapshot` as the first outbound message.
   */
  registerWatchConnection: (
    connection: GameWatchConnection,
  ) => Promise<DataErrorSignature<void>>;
  /**
   * Plays one bot choice for whichever side the prompt belongs to. The choice
   * and its effects reach the watcher through fanout. A step that plays
   * nothing (game over, or stuck) is a failure.
   */
  stepBotVsBotGame: (
    connection: GameWatchConnection,
  ) => Promise<DataErrorSignature<void>>;
  /** Sends the current authoritative `gameSnapshot` to a registered watcher. */
  sendWatchSnapshot: (
    connection: GameWatchConnection,
  ) => Promise<DataErrorSignature<void>>;
  /** Removes a watcher from fanout. */
  unregisterWatchConnection: (connection: GameWatchConnection) => void;
  /** Submits a player choice for an in-memory game. */
  submitPlayerChoice: (input: {
    gameId: string;
    side: PlayerSide;
    subject: string;
    playerChoice: PlayerChoiceEvent;
  }) => Promise<DataErrorSignature<void>>;
  /**
   * Registers a seat connection for projected event / snapshot fanout and
   * sends that seat its current `gameSnapshot` as the first outbound message
   * (after any queued bot/effect resume for the human seat).
   */
  registerSeatConnection: (
    connection: GameSeatConnection,
  ) => Promise<DataErrorSignature<void>>;
  /**
   * Sends the current seat-visible `gameSnapshot` to a registered connection
   * (client recovery / resync).
   */
  sendGameSnapshot: (
    connection: GameSeatConnection,
  ) => Promise<DataErrorSignature<void>>;
  /** Removes a seat connection from fanout. */
  unregisterSeatConnection: (connection: GameSeatConnection) => void;
  /** Resolves which subject owns a seat for a game. */
  getSeatSubject: (gameId: string, side: PlayerSide) => string | undefined;
}

export type {
  GameSeatConnection,
  GameSessionOutbound,
  GameSessionUseCasesPort,
  GameWatchConnection,
  GameWatchOutbound,
};
