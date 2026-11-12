/**
 * Contract-driven in-game seat WebSocket registration.
 *
 * Mirrors HTTP `implement*Route`: path/auth/params/inbound come from the
 * contract; handlers only wire use-case calls.
 */
import type { InGameSeatContract } from '@classicalmoser/prevail-contracts';
import type {
  InGameSeatWsHandler,
  LoggerPort,
  RegisteredWsRoute,
  RequestAuth,
  WireWsConnection,
  WsSeatConnectionContext,
} from '@ports';
import type { FailValidationResult } from '@classicalmoser/prevail-rules/domain';
import { createInboundHandler } from './create-inbound-handler';
import type { InboundHandler } from './create-inbound-handler';
import { implementWsRoute } from './implement-ws-route';
import type { WsOutcome } from './ws-types';

/**
 * Rename a seat handler's refusal to the shared outcome shape.
 *
 * @param result - What the seat handler answered.
 * @returns The same answer, with the refusal under `rejection`.
 */
const toOutcome = (
  result: { ok: true } | { ok: false; choiceRejected: FailValidationResult },
): WsOutcome => {
  if (result.ok) {
    return { ok: true };
  }
  const refused: WsOutcome = { ok: false, rejection: result.choiceRejected };
  return refused;
};

/**
 * Build one registered WebSocket route from an in-game seat contract.
 *
 * Params and inbound messages are parsed with the contract Zod schemas.
 * The connection handle returned from `onOpen` is passed back to snapshot,
 * choice, and close handlers without the route knowing the handle's shape.
 *
 * @param contract - Seat contract for one side.
 * @param logger - Where unexpected socket failures are recorded.
 * @param handlers - Open, choice, snapshot, and close callbacks.
 * @returns A route the composition root can mount.
 */
const implementInGameSeatWs = <
  TSide extends 'white' | 'black',
  TParams extends Record<string, unknown>,
  TInboundPlayerChoice,
  TOutboundPlayerChoice,
  TGameEffect,
  TGameSnapshot,
  TChoiceRejected,
  THandle = unknown,
>(
  contract: InGameSeatContract<
    TSide,
    TParams,
    TInboundPlayerChoice,
    TOutboundPlayerChoice,
    TGameEffect,
    TGameSnapshot,
    TChoiceRejected
  >,
  logger: LoggerPort,
  handlers: InGameSeatWsHandler<TParams, TInboundPlayerChoice, THandle>,
): RegisteredWsRoute => {
  // The side is fixed by the path, so no message can name a seat to play as.
  const buildContext = (
    admitted: { params: TParams; auth: RequestAuth },
    wire: WireWsConnection,
  ): WsSeatConnectionContext<TParams> => {
    const context: WsSeatConnectionContext<TParams> = {
      auth: admitted.auth,
      headers: wire.headers,
      params: admitted.params,
      side: contract.side,
    };
    return context;
  };

  // A seat plays a choice for its own side.
  const playerChoice: InboundHandler<
    WsSeatConnectionContext<TParams>,
    THandle
  > = createInboundHandler({
    run: async (choice: TInboundPlayerChoice, context, connectionHandle) => {
      const result = await handlers.onPlayerChoice(
        context,
        choice,
        connectionHandle,
      );
      return toOutcome(result);
    },
    schema: contract.validators.inbound.playerChoice,
  });

  // A seat asks for the game as it is allowed to see it, to resync.
  const requestGameSnapshot: InboundHandler<
    WsSeatConnectionContext<TParams>,
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
      ['playerChoice', playerChoice],
      ['requestGameSnapshot', requestGameSnapshot],
    ]),
    logger,
    open: handlers.onOpen,
    paramsSchema: contract.validators.params,
    path: contract.path,
    rejectedType: 'choiceRejected',
  });
  return route;
};

export { implementInGameSeatWs };
