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
  RequestAuth,
  WireWsConnection,
  WsWatchConnectionContext,
} from '@ports';
import type { FailValidationResult } from '@classicalmoser/prevail-rules/domain';
import { createInboundHandler } from './create-inbound-handler';
import type { InboundHandler } from './create-inbound-handler';
import { implementWsRoute } from './implement-ws-route';
import type { WsOutcome } from './ws-types';

/**
 * Rename a watcher handler's refusal to the shared outcome shape.
 *
 * @param result - What the watcher handler answered.
 * @returns The same answer, with the refusal under `rejection`.
 */
const toOutcome = (
  result: { ok: true } | { ok: false; stepRejected: FailValidationResult },
): WsOutcome => {
  if (result.ok) {
    return { ok: true };
  }
  const refused: WsOutcome = { ok: false, rejection: result.stepRejected };
  return refused;
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
): RegisteredWsRoute => {
  // A watcher has no seat, so its context is only who and what it asked for.
  const buildContext = (
    admitted: { params: TParams; auth: RequestAuth },
    wire: WireWsConnection,
  ): WsWatchConnectionContext<TParams> => {
    const context: WsWatchConnectionContext<TParams> = {
      auth: admitted.auth,
      headers: wire.headers,
      params: admitted.params,
    };
    return context;
  };

  // A step plays one bot choice; its events arrive through fanout.
  const step: InboundHandler<
    WsWatchConnectionContext<TParams>,
    THandle
  > = createInboundHandler({
    emptyPayloadAllowed: true,
    run: async (_data, context, connectionHandle) => {
      const result = await handlers.onStep(context, connectionHandle);
      return toOutcome(result);
    },
    schema: contract.validators.inbound.step,
  });

  // A resync replies with the authoritative snapshot.
  const requestGameSnapshot: InboundHandler<
    WsWatchConnectionContext<TParams>,
    THandle
  > = createInboundHandler({
    emptyPayloadAllowed: true,
    run: async (_data, context, connectionHandle) => {
      const result = await handlers.onRequestGameSnapshot(
        context,
        connectionHandle,
      );
      return toOutcome(result);
    },
    schema: contract.validators.inbound.requestGameSnapshot,
  });

  const route = implementWsRoute({
    auth: contract.auth,
    buildContext,
    close: handlers.onClose,
    inbound: new Map([
      ['step', step],
      ['requestGameSnapshot', requestGameSnapshot],
    ]),
    logger,
    open: handlers.onOpen,
    paramsSchema: contract.validators.params,
    path: contract.path,
    rejectedType: 'stepRejected',
  });
  return route;
};

export { implementInGameBotVsBotWs };
