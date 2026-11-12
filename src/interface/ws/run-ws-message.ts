import type { LoggerPort } from '@ports';
import { handleError, runDetached } from '@utils';
import { sendRejection } from './send-rejection';
import type { RejectionType, SendJson, WsOutcome } from './ws-types';

/**
 * Run one client message's handler off the socket's message loop.
 *
 * A refused message sends its rejection payload to that client only. A throw
 * is logged and answered with an internal-error rejection, so a bug in a
 * handler never leaves the client waiting for a reply.
 *
 * @param input - The handler call, socket writer, message type, path, logger.
 */
const runWsMessage = (input: {
  handle: () => Promise<WsOutcome>;
  rejectedType: RejectionType;
  sendJson: SendJson;
  type: string;
  path: string;
  logger: LoggerPort;
}): void => {
  runDetached(async () => {
    try {
      const outcome = await input.handle();
      if (!outcome.ok) {
        // The refusal's payload is what the client folds into its UI.
        input.sendJson({
          payload: outcome.rejection,
          type: input.rejectedType,
        });
      }
    } catch (error) {
      // The thrown text stays in the server log; the client is told only
      // 'Internal error' so a bug never leaks internals to a player.
      handleError({
        context: `handling ${input.type} on ${input.path}`,
        error,
        logger: input.logger,
        message: `Failed to handle ${input.type} on ${input.path}`,
        status: 500,
      });
      sendRejection(input.sendJson, input.rejectedType, 'Internal error');
    }
  });
};

export { runWsMessage };
