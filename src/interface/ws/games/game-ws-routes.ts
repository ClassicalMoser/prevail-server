import type { GameWsParams } from '@classicalmoser/prevail-contracts';
import {
  blackInGameWsContract,
  whiteInGameWsContract,
} from '@classicalmoser/prevail-contracts';
import type { PlayerChoiceEvent } from '@classicalmoser/prevail-rules/domain';
import type {
  GameSeatConnection,
  GameSessionOutbound,
  GameSessionUseCasesPort,
  InGameSeatWsHandler,
  LoggerPort,
  WsRouteRegistry,
  WsSeatConnectionContext,
} from '@ports';
import { implementInGameSeatWs } from '../implement-in-game-seat-ws';

type SeatOpenResult = Awaited<
  ReturnType<
    InGameSeatWsHandler<
      GameWsParams,
      PlayerChoiceEvent,
      GameSeatConnection
    >['onOpen']
  >
>;

type SeatChoiceResult = Awaited<
  ReturnType<
    InGameSeatWsHandler<GameWsParams, PlayerChoiceEvent>['onPlayerChoice']
  >
>;

type SeatSnapshotResult = Awaited<
  ReturnType<
    InGameSeatWsHandler<
      GameWsParams,
      PlayerChoiceEvent
    >['onRequestGameSnapshot']
  >
>;

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
  ): Promise<SeatOpenResult> => {
    const connection: GameSeatConnection = {
      gameId: context.params.gameId,
      send: (message: GameSessionOutbound) => {
        send(message);
      },
      side,
      subject: context.auth.subject,
    };
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
  ): Promise<SeatChoiceResult> => {
    const result = await gameSessionUseCases.submitPlayerChoice({
      gameId: context.params.gameId,
      playerChoice: choice,
      side,
      subject: context.auth.subject,
    });
    if (!result.success) {
      return {
        choiceRejected: {
          errorReason: result.message,
          result: false,
        },
        ok: false,
      };
    }
    return { ok: true };
  },
  onRequestGameSnapshot: async (
    _context: WsSeatConnectionContext<GameWsParams>,
    handle: GameSeatConnection,
  ): Promise<SeatSnapshotResult> => {
    const result = await gameSessionUseCases.sendGameSnapshot(handle);
    if (!result.success) {
      return {
        choiceRejected: {
          errorReason: result.message,
          result: false,
        },
        ok: false,
      };
    }
    return { ok: true };
  },
  onClose: (
    _context: WsSeatConnectionContext<GameWsParams>,
    handle: GameSeatConnection,
  ): void => {
    gameSessionUseCases.unregisterSeatConnection(handle);
  },
});

const createGameWsRoutes = (
  gameSessionUseCases: GameSessionUseCasesPort,
  logger: LoggerPort,
): WsRouteRegistry => [
  implementInGameSeatWs(
    whiteInGameWsContract,
    logger,
    createSeatHandlers('white', gameSessionUseCases),
  ),
  implementInGameSeatWs(
    blackInGameWsContract,
    logger,
    createSeatHandlers('black', gameSessionUseCases),
  ),
];

export { createGameWsRoutes };
