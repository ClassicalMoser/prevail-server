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
  // A step that plays nothing (game over, stuck) goes back to the watcher as
  // stepRejected with the use case's message.
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
    // The connection is the watcher's mailbox: the session writes unprojected
    // events to it, since both seats are bots.
    const connection: GameWatchConnection = {
      gameId: context.params.gameId,
      send: (message: GameWatchOutbound) => {
        send(message);
      },
      subject: context.auth.subject,
    };
    // Only the game's creator may watch; the session refuses anyone else, and
    // the refusal message becomes the close reason.
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
    // The server never advances a bot-vs-bot game itself: each step the watcher
    // sends plays one bot choice.
    const result = await gameSessionUseCases.stepBotVsBotGame(handle);
    const answered = toWatchMessageResult(result);
    return answered;
  },
  onRequestGameSnapshot: async (
    _context: WsWatchConnectionContext<GameWsParams>,
    handle: GameWatchConnection,
  ): Promise<WatchMessageResult> => {
    // A resync: the watcher is sent the authoritative game.
    const result = await gameSessionUseCases.sendWatchSnapshot(handle);
    const answered = toWatchMessageResult(result);
    return answered;
  },
  onClose: (
    _context: WsWatchConnectionContext<GameWsParams>,
    handle: GameWatchConnection,
  ): void => {
    // A closed watcher stops receiving events.
    gameSessionUseCases.unregisterWatchConnection(handle);
  },
});

export { createWatchHandlers };
