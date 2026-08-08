/**
 * Contract-driven in-game seat WebSocket registration.
 *
 * Mirrors HTTP `implement*Route`: path/auth/params/playerChoice come from the
 * contract; handlers only wire use-case calls.
 */
import type { InGameSeatContract } from '@classicalmoser/prevail-contracts';
import type {
  InGameSeatWsHandler,
  LoggerPort,
  RegisteredWsRoute,
} from '@ports';
import { handleError, runDetached } from '@utils';

const implementInGameSeatWs = <
  TSide extends 'white' | 'black',
  TParams extends Record<string, unknown>,
  TInboundPlayerChoice,
  TOutboundPlayerChoice,
  TGameEffect,
  TRoundSnapshot,
  TChoiceRejected,
>(
  contract: InGameSeatContract<
    TSide,
    TParams,
    TInboundPlayerChoice,
    TOutboundPlayerChoice,
    TGameEffect,
    TRoundSnapshot,
    TChoiceRejected
  >,
  logger: LoggerPort,
  handlers: InGameSeatWsHandler<TParams, TInboundPlayerChoice>,
): RegisteredWsRoute => ({
  path: contract.path,
  side: contract.side,
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

    const context = {
      auth: wire.auth,
      headers: wire.headers,
      params: paramsParsed.data,
      side: contract.side,
    };

    const sendJson = (message: unknown): void => {
      socket.send(JSON.stringify(message));
    };

    let connectionHandle: unknown = undefined;
    try {
      const opened = await handlers.onOpen(context, sendJson);
      if (!opened.ok) {
        socket.close(opened.closeCode ?? 1008, opened.reason);
        return;
      }
      connectionHandle = opened.connectionHandle;
    } catch (error) {
      handleError({
        context: `opening WS ${contract.path}`,
        error,
        logger,
        message: `Failed to open ${contract.path}`,
        status: 500,
      });
      socket.close(1011, 'Internal error');
      return;
    }

    socket.onMessage((raw) => {
      let parsedJson: unknown = undefined;
      try {
        parsedJson = JSON.parse(raw) as unknown;
      } catch {
        sendJson({
          payload: {
            errorReason: 'Invalid JSON',
            result: false,
          },
          type: 'choiceRejected',
        });
        return;
      }

      const choiceParsed =
        contract.validators.playerChoice.safeParse(parsedJson);
      if (!choiceParsed.success) {
        sendJson({
          payload: {
            errorReason: 'Invalid playerChoice',
            result: false,
          },
          type: 'choiceRejected',
        });
        return;
      }

      runDetached(async () => {
        try {
          const result = await handlers.onPlayerChoice(
            context,
            choiceParsed.data,
            connectionHandle,
          );
          if (!result.ok) {
            sendJson({
              payload: result.choiceRejected,
              type: 'choiceRejected',
            });
          }
        } catch (error) {
          handleError({
            context: `handling playerChoice on ${contract.path}`,
            error,
            logger,
            message: `Failed to handle playerChoice on ${contract.path}`,
            status: 500,
          });
          sendJson({
            payload: {
              errorReason: 'Internal error',
              result: false,
            },
            type: 'choiceRejected',
          });
        }
      });
    });

    socket.onClose(() => {
      handlers.onClose(context, connectionHandle);
    });
  },
});

export { implementInGameSeatWs };
