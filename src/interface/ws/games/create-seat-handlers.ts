import type { GameWsParams } from '@classicalmoser/prevail-contracts';
import type { PlayerChoiceEvent } from '@classicalmoser/prevail-rules/domain';
import type {
  DataErrorSignature,
  GameSeatConnection,
  GameSessionOutbound,
  GameSessionUseCasesPort,
  InGameSeatWsHandler,
  SeatMessageResult,
  WsOpenResult,
  WsSeatConnectionContext,
} from '@ports';

/**
 * A use-case envelope as a seat message result.
 *
 * @param result - What the use case returned.
 * @returns Done, or the `choiceRejected` payload carrying its message.
 */
const toSeatMessageResult = (
  result: DataErrorSignature<void>,
): SeatMessageResult => {
  // A refused choice goes back to that seat as choiceRejected with the use
  // case's message, leaving its state unchanged.
  if (!result.success) {
    const rejected: SeatMessageResult = {
      ok: false,
      choiceRejected: {
        errorReason: result.message,
        result: false,
      },
    };
    return rejected;
  }
  const done: SeatMessageResult = { ok: true };
  return done;
};

/**
 * Seat handlers for one side of a live game.
 *
 * `onOpen` registers the connection and sends the first snapshot from inside
 * the session queue, so that snapshot is the first outbound message. Later
 * choices and snapshot requests use the same connection handle.
 *
 * @param side - White or black seat this handler set owns.
 * @param gameSessionUseCases - Session API the handlers call.
 * @returns Handlers for the in-game seat WebSocket contract.
 */
const createSeatHandlers = (
  side: 'white' | 'black',
  gameSessionUseCases: GameSessionUseCasesPort,
): InGameSeatWsHandler<
  GameWsParams,
  PlayerChoiceEvent,
  GameSeatConnection
> => ({
  onOpen: async (
    context: WsSeatConnectionContext<GameWsParams>,
    send: (message: unknown) => void,
  ): Promise<WsOpenResult<GameSeatConnection>> => {
    // The connection is the seat's mailbox: the session writes events to it.
    const connection: GameSeatConnection = {
      gameId: context.params.gameId,
      send: (message: GameSessionOutbound) => {
        send(message);
      },
      side,
      subject: context.auth.subject,
    };
    // The session checks that this subject owns the seat; a refusal closes the
    // socket with its message as the reason.
    const registered =
      await gameSessionUseCases.registerSeatConnection(connection);
    if (!registered.success) {
      return {
        ok: false,
        reason: registered.message,
      };
    }
    return { connectionHandle: connection, ok: true };
  },
  onPlayerChoice: async (
    context: WsSeatConnectionContext<GameWsParams>,
    choice: PlayerChoiceEvent,
    _handle: GameSeatConnection,
  ): Promise<SeatMessageResult> => {
    // The seat plays for its own side only; the session checks the subject.
    const result = await gameSessionUseCases.submitPlayerChoice({
      gameId: context.params.gameId,
      playerChoice: choice,
      side,
      subject: context.auth.subject,
    });
    const answered = toSeatMessageResult(result);
    return answered;
  },
  onRequestGameSnapshot: async (
    _context: WsSeatConnectionContext<GameWsParams>,
    handle: GameSeatConnection,
  ): Promise<SeatMessageResult> => {
    // A resync: the seat is sent the game projected for its own side.
    const result = await gameSessionUseCases.sendGameSnapshot(handle);
    const answered = toSeatMessageResult(result);
    return answered;
  },
  onClose: (
    _context: WsSeatConnectionContext<GameWsParams>,
    handle: GameSeatConnection,
  ): void => {
    // A closed seat stops receiving events.
    gameSessionUseCases.unregisterSeatConnection(handle);
  },
});

export { createSeatHandlers };
