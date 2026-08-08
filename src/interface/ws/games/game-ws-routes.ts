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
  ReturnType<InGameSeatWsHandler<GameWsParams, PlayerChoiceEvent>['onOpen']>
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

const createSeatHandlers = (
  side: 'white' | 'black',
  gameSessionUseCases: GameSessionUseCasesPort,
): InGameSeatWsHandler<GameWsParams, PlayerChoiceEvent> => ({
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
    _handle: unknown,
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
    handle: unknown,
  ): Promise<SeatSnapshotResult> => {
    const result = await gameSessionUseCases.sendGameSnapshot(
      handle as GameSeatConnection,
    );
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
    handle: unknown,
  ): void => {
    gameSessionUseCases.unregisterSeatConnection(handle as GameSeatConnection);
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
