import type { RejectionType, SendJson } from './ws-types';

/**
 * Tell a client its message did nothing, with only a reason.
 *
 * A seat is told `choiceRejected` and a watcher `stepRejected`. Either way the
 * board is unchanged, so the client keeps the state it has.
 *
 * @param sendJson - Socket writer.
 * @param type - Which rejection message this socket's client expects.
 * @param errorReason - Why the message did nothing.
 */
const sendRejection = (
  sendJson: SendJson,
  type: RejectionType,
  errorReason: string,
): void => {
  const rejection = { errorReason, result: false };
  sendJson({ payload: rejection, type });
};

export { sendRejection };
