/**
 * Contract-driven bot-vs-bot WebSocket registration.
 *
 * The watcher twin of `implementInGameSeatWs`: path/auth/params/inbound come
 * from the contract, and handlers only wire use-case calls. There is no seat,
 * and the inbound action is `step` rather than a player choice.
 */
import type { InGameBotVsBotContract } from '@classicalmoser/prevail-contracts';
import type {
  InGameBotVsBotWsHandler,
  LoggerPort,
  RegisteredWsRoute,
  WsWatchConnectionContext,
} from '@ports';
import { handleError, runDetached } from '@utils';
import { readInboundEnvelope } from './read-inbound-envelope';

type WatchOpenResult<THandle> = Awaited<
  ReturnType<
    InGameBotVsBotWsHandler<Record<string, unknown>, THandle>['onOpen']
  >
>;

type WatchMessageResult = Awaited<
  ReturnType<InGameBotVsBotWsHandler<Record<string, unknown>>['onStep']>
>;

/**
 * Send a `stepRejected` with only a reason. The board is unchanged.
 *
 * @param sendJson - Socket writer.
 * @param errorReason - Why the message did nothing.
 */
const sendStepRejected = (
  sendJson: (message: unknown) => void,
  errorReason: string,
): void => {
  sendJson({
    payload: {
      errorReason,
      result: false,
    },
    type: 'stepRejected',
  });
};

/**
 * Run the open handler, turning a throw into an internal-error close.
 *
 * @param input - Handlers, validated context, socket writer, path, logger.
 * @returns The handler's result, or a 1011 close on a throw.
 */
const openWatchConnection = async <
  TParams extends Record<string, unknown>,
  THandle,
>(input: {
  handlers: InGameBotVsBotWsHandler<TParams, THandle>;
  context: WsWatchConnectionContext<TParams>;
  sendJson: (message: unknown) => void;
  path: string;
  logger: LoggerPort;
}): Promise<WatchOpenResult<THandle>> => {
  try {
    return await input.handlers.onOpen(input.context, input.sendJson);
  } catch (error) {
    handleError({
      context: `opening WS ${input.path}`,
      error,
      logger: input.logger,
      message: `Failed to open ${input.path}`,
      status: 500,
    });
    return {
      closeCode: 1011,
      ok: false,
      reason: 'Internal error',
    };
  }
};

/**
 * Run one watcher message handler off the socket's message loop.
 *
 * A refused message sends its `stepRejected` payload. A throw is logged and
 * answered with an internal-error `stepRejected`.
 *
 * @param input - The handler call, socket writer, message type, path, logger.
 */
const runWatchMessage = (input: {
  handle: () => Promise<WatchMessageResult>;
  sendJson: (message: unknown) => void;
  type: string;
  path: string;
  logger: LoggerPort;
}): void => {
  runDetached(async () => {
    try {
      const result = await input.handle();
      if (!result.ok) {
        input.sendJson({
          payload: result.stepRejected,
          type: 'stepRejected',
        });
      }
    } catch (error) {
      handleError({
        context: `handling ${input.type} on ${input.path}`,
        error,
        logger: input.logger,
        message: `Failed to handle ${input.type} on ${input.path}`,
        status: 500,
      });
      sendStepRejected(input.sendJson, 'Internal error');
    }
  });
};

/**
 * Build one registered WebSocket route from the bot-vs-bot contract.
 *
 * Params and inbound messages are parsed with the contract Zod schemas.
 * The connection handle returned from `onOpen` is passed back to the step,
 * snapshot, and close handlers without the route knowing its shape.
 *
 * @param contract - Bot-vs-bot watcher contract.
 * @param logger - Where unexpected socket failures are recorded.
 * @param handlers - Open, step, snapshot, and close callbacks.
 * @returns A route the composition root can mount.
 */
const implementInGameBotVsBotWs = <
  TParams extends Record<string, unknown>,
  TPlayerChoice,
  TGameEffect,
  TGameSnapshot,
  TStepRejected,
  THandle = unknown,
>(
  contract: InGameBotVsBotContract<
    TParams,
    TPlayerChoice,
    TGameEffect,
    TGameSnapshot,
    TStepRejected
  >,
  logger: LoggerPort,
  handlers: InGameBotVsBotWsHandler<TParams, THandle>,
): RegisteredWsRoute => ({
  path: contract.path,
  auth: contract.auth,
  onConnection: async (wire, socket): Promise<void> => {
    const paramsParsed = contract.validators.params.safeParse(wire.params);
    if (!paramsParsed.success) {
      socket.close(1008, 'Invalid params');
      return;
    }
    if (wire.auth === undefined) {
      socket.close(1008, 'Unauthorized');
      return;
    }

    const context: WsWatchConnectionContext<TParams> = {
      auth: wire.auth,
      headers: wire.headers,
      params: paramsParsed.data,
    };
    const sendJson = (message: unknown): void => {
      socket.send(JSON.stringify(message));
    };

    const openResult = await openWatchConnection({
      context,
      handlers,
      logger,
      path: contract.path,
      sendJson,
    });
    if (!openResult.ok) {
      socket.close(openResult.closeCode ?? 1008, openResult.reason);
      return;
    }
    const { connectionHandle } = openResult;

    socket.onMessage((raw) => {
      const envelope = readInboundEnvelope(raw);
      if (!envelope.ok) {
        sendStepRejected(sendJson, envelope.errorReason);
        return;
      }
      const { type, payload } = envelope;
      const messageInput = { logger, path: contract.path, sendJson, type };

      // A step plays one bot choice; its events arrive through fanout.
      if (type === 'step') {
        const stepParsed = contract.validators.inbound.step.safeParse(
          payload ?? {},
        );
        if (!stepParsed.success) {
          sendStepRejected(sendJson, 'Invalid step');
          return;
        }
        runWatchMessage({
          ...messageInput,
          handle: async () => handlers.onStep(context, connectionHandle),
        });
        return;
      }

      // A resync replies with the authoritative snapshot.
      if (type === 'requestGameSnapshot') {
        const snapshotParsed =
          contract.validators.inbound.requestGameSnapshot.safeParse(
            payload ?? {},
          );
        if (!snapshotParsed.success) {
          sendStepRejected(sendJson, 'Invalid requestGameSnapshot');
          return;
        }
        runWatchMessage({
          ...messageInput,
          handle: async () =>
            handlers.onRequestGameSnapshot(context, connectionHandle),
        });
        return;
      }

      sendStepRejected(sendJson, 'Invalid inbound message');
    });

    socket.onClose(() => {
      handlers.onClose(context, connectionHandle);
    });
  },
});

export { implementInGameBotVsBotWs };
