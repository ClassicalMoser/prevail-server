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
  WsSeatConnectionContext,
} from '@ports';
import { handleError, runDetached } from '@utils';

const parseInboundJson = (
  raw: string,
): { ok: true; value: unknown } | { ok: false } => {
  try {
    return { ok: true, value: JSON.parse(raw) as unknown };
  } catch {
    return { ok: false };
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

interface SeatOpenResultOk {
  ok: true;
  connectionHandle: unknown;
}

interface SeatOpenResultFail {
  ok: false;
  closeCode?: number;
  reason: string;
}

type SeatOpenResult = SeatOpenResultOk | SeatOpenResultFail;

const openSeatConnection = async <
  TParams extends Record<string, unknown>,
  TInboundPlayerChoice,
>(input: {
  handlers: InGameSeatWsHandler<TParams, TInboundPlayerChoice>;
  context: WsSeatConnectionContext<TParams>;
  sendJson: (message: unknown) => void;
  path: string;
  logger: LoggerPort;
}): Promise<SeatOpenResult> => {
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

const sendChoiceRejected = (
  sendJson: (message: unknown) => void,
  errorReason: string,
): void => {
  sendJson({
    payload: {
      errorReason,
      result: false,
    },
    type: 'choiceRejected',
  });
};

const implementInGameSeatWs = <
  TSide extends 'white' | 'black',
  TParams extends Record<string, unknown>,
  TInboundPlayerChoice,
  TOutboundPlayerChoice,
  TGameEffect,
  TGameSnapshot,
  TChoiceRejected,
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

    const openResult = await openSeatConnection({
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
      const parsedJson = parseInboundJson(raw);
      if (!parsedJson.ok) {
        sendChoiceRejected(sendJson, 'Invalid JSON');
        return;
      }

      if (
        !isRecord(parsedJson.value) ||
        typeof parsedJson.value.type !== 'string'
      ) {
        sendChoiceRejected(sendJson, 'Invalid inbound message');
        return;
      }

      const { type, payload } = parsedJson.value;

      if (type === 'playerChoice') {
        const choiceParsed =
          contract.validators.inbound.playerChoice.safeParse(payload);
        if (!choiceParsed.success) {
          sendChoiceRejected(sendJson, 'Invalid playerChoice');
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
            sendChoiceRejected(sendJson, 'Internal error');
          }
        });
        return;
      }

      if (type === 'requestGameSnapshot') {
        const snapshotParsed =
          contract.validators.inbound.requestGameSnapshot.safeParse(
            payload ?? {},
          );
        if (!snapshotParsed.success) {
          sendChoiceRejected(sendJson, 'Invalid requestGameSnapshot');
          return;
        }

        runDetached(async () => {
          try {
            const result = await handlers.onRequestGameSnapshot(
              context,
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
              context: `handling requestGameSnapshot on ${contract.path}`,
              error,
              logger,
              message: `Failed to handle requestGameSnapshot on ${contract.path}`,
              status: 500,
            });
            sendChoiceRejected(sendJson, 'Internal error');
          }
        });
        return;
      }

      sendChoiceRejected(sendJson, 'Invalid inbound message');
    });

    socket.onClose(() => {
      handlers.onClose(context, connectionHandle);
    });
  },
});

export { implementInGameSeatWs };
