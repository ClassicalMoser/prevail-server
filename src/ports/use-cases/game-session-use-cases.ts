import type {
  BotVsBotStepData,
  CreateBotVsBotGameBody,
  CreateVsBotGameBody,
} from '@classicalmoser/prevail-contracts';
import type {
  FailValidationResult,
  GameForVisibility,
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

interface GameSessionUseCasesPort {
  /** Creates a human-vs-bot game; returns the new game id. */
  createVsBotGame: (
    subject: string,
    body: CreateVsBotGameBody,
  ) => Promise<DataErrorSignature<string>>;
  /** Creates a bot-vs-bot game; returns the authoritative opening game. */
  createBotVsBotGame: (
    subject: string,
    body: CreateBotVsBotGameBody,
  ) => Promise<DataErrorSignature<GameForVisibility<'authoritative'>>>;
  /** Returns the current authoritative bot-vs-bot game without playing. */
  getBotVsBotGame: (
    subject: string,
    gameId: string,
  ) => Promise<DataErrorSignature<GameForVisibility<'authoritative'>>>;
  /** Plays one bot choice for whichever side the prompt belongs to. */
  stepBotVsBotGame: (
    subject: string,
    gameId: string,
  ) => Promise<DataErrorSignature<BotVsBotStepData>>;
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
};
