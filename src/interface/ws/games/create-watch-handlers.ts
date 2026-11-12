import type { GameWsParams } from '@classicalmoser/prevail-contracts';
import type {
  DataErrorSignature,
  GameSessionUseCasesPort,
  GameWatchConnection,
  GameWatchOutbound,
  InGameBotVsBotWsHandler,
  WatchMessageResult,
  WsOpenResult,
  WsWatchConnectionContext,
} from '@ports';

/**
 * A use-case envelope as a watcher message result.
 *
 * @param result - What the use case returned.
 * @returns Done, or the `stepRejected` payload carrying its message.
 */
const toWatchMessageResult = (
  result: DataErrorSignature<void>,
): WatchMessageResult => {
  if (!result.success) {
    const rejected: WatchMessageResult = {
      ok: false,
      stepRejected: {
        errorReason: result.message,
        result: false,
      },
    };
    return rejected;
  }
  const done: WatchMessageResult = { ok: true };
  return done;
};

/**
 * Handlers for the socket that watches and steps a bot-vs-bot game.
 *
 * `onOpen` registers the watcher and sends the first snapshot from inside
 * the session queue, so that snapshot is the first outbound message. Steps
 * and snapshot requests use the same connection handle.
 *
 * @param gameSessionUseCases - Session API the handlers call.
 * @returns Handlers for the bot-vs-bot WebSocket contract.
 */
const createWatchHandlers = (
  gameSessionUseCases: GameSessionUseCasesPort,
): InGameBotVsBotWsHandler<GameWsParams, GameWatchConnection> => ({
  onOpen: async (
    context: WsWatchConnectionContext<GameWsParams>,
    send: (message: unknown) => void,
  ): Promise<WsOpenResult<GameWatchConnection>> => {
    const connection: GameWatchConnection = {
      gameId: context.params.gameId,
      send: (message: GameWatchOutbound) => {
        send(message);
      },
      subject: context.auth.subject,
    };
    const registered =
      await gameSessionUseCases.registerWatchConnection(connection);
    if (!registered.success) {
      return {
        ok: false,
        reason: registered.message,
      };
    }
    return { connectionHandle: connection, ok: true };
  },
  onStep: async (
    _context: WsWatchConnectionContext<GameWsParams>,
    handle: GameWatchConnection,
  ): Promise<WatchMessageResult> => {
    const result = await gameSessionUseCases.stepBotVsBotGame(handle);
    const answered = toWatchMessageResult(result);
    return answered;
  },
  onRequestGameSnapshot: async (
    _context: WsWatchConnectionContext<GameWsParams>,
    handle: GameWatchConnection,
  ): Promise<WatchMessageResult> => {
    const result = await gameSessionUseCases.sendWatchSnapshot(handle);
    const answered = toWatchMessageResult(result);
    return answered;
  },
  onClose: (
    _context: WsWatchConnectionContext<GameWsParams>,
    handle: GameWatchConnection,
  ): void => {
    gameSessionUseCases.unregisterWatchConnection(handle);
  },
});

export { createWatchHandlers };
