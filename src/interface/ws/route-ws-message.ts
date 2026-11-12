import type { LoggerPort } from '@ports';
import type { InboundHandler } from './create-inbound-handler';
import { readInboundEnvelope } from './read-inbound-envelope';
import { runWsMessage } from './run-ws-message';
import { sendRejection } from './send-rejection';
import type { RejectionType, SendJson } from './ws-types';

/**
 * Send one raw client message to the handler for its type.
 *
 * A frame that is not a tagged message, a type the route does not take, and a
 * payload the contract refuses are each answered with a rejection to that
 * client. Nothing reaches a use case until all three checks pass.
 *
 * @param input - The frame, the route's handlers by type, and where to answer.
 */
const routeWsMessage = <TContext, THandle>(input: {
  raw: string;
  inbound: ReadonlyMap<string, InboundHandler<TContext, THandle>>;
  context: TContext;
  connectionHandle: THandle;
  rejectedType: RejectionType;
  sendJson: SendJson;
  path: string;
  logger: LoggerPort;
}): void => {
  const reject = (errorReason: string): void => {
    sendRejection(input.sendJson, input.rejectedType, errorReason);
  };

  // Step 1: the frame must be a `{ type, payload }` envelope.
  const envelope = readInboundEnvelope(input.raw);
  if (!envelope.ok) {
    reject(envelope.errorReason);
    return;
  }

  // Step 2: the route must take this message type.
  const handler = input.inbound.get(envelope.type);
  if (handler === undefined) {
    reject('Invalid inbound message');
    return;
  }

  // Step 3: the payload must satisfy the contract's schema for this type.
  const work = handler(envelope.payload, input.context, input.connectionHandle);
  if (work === undefined) {
    reject(`Invalid ${envelope.type}`);
    return;
  }

  runWsMessage({
    handle: work,
    logger: input.logger,
    path: input.path,
    rejectedType: input.rejectedType,
    sendJson: input.sendJson,
    type: envelope.type,
  });
};

export { routeWsMessage };
