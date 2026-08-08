import type { CreateVsBotGameBody } from '@classicalmoser/prevail-contracts';
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
  | { type: 'roundSnapshot'; payload: unknown }
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
  /** Submits a player choice for an in-memory game. */
  submitPlayerChoice: (input: {
    gameId: string;
    side: PlayerSide;
    subject: string;
    playerChoice: PlayerChoiceEvent;
  }) => Promise<DataErrorSignature<void>>;
  /**
   * Registers a seat connection for projected event / snapshot fanout and
   * immediately sends that seat its current `roundSnapshot`.
   */
  registerSeatConnection: (
    connection: GameSeatConnection,
  ) => Promise<DataErrorSignature<void>>;
  /** Removes a seat connection from fanout. */
  unregisterSeatConnection: (connection: GameSeatConnection) => void;
  /** Resolves which subject owns a seat for a game. */
  getSeatSubject: (
    gameId: string,
    side: PlayerSide,
  ) => string | undefined;
}

export type {
  GameSeatConnection,
  GameSessionOutbound,
  GameSessionUseCasesPort,
};
