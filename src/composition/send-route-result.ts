import type { FastifyReply } from 'fastify';
import type { RegisteredRoute, RouteInvokeResult } from '@ports';
import { isDataSignature, isErrorSignature } from '@utils';

const jsonContentType = 'application/json' as const;

/**
 * Maps a handler return envelope to the HTTP wire format.
 *
 * Success with JSON body: `JSON.stringify`d payload so primitive values (e.g. a
 * bare string id) are emitted as valid JSON. Fastify forwards string payloads
 * verbatim, so without this an unquoted value would be sent as invalid JSON.
 * Success with media body: raw payload with `successContentType`.
 * Success without body: HTTP 204 only.
 * Error: `{ message }` with `envelope.status`.
 *
 * @param reply - Fastify reply for this request.
 * @param envelope - What the route's handler answered.
 * @param route - The route, which names its success status and content type.
 * @returns The reply, once the response is queued.
 */
const sendRouteResult = (
  reply: FastifyReply,
  envelope: RouteInvokeResult,
  route: RegisteredRoute,
): FastifyReply => {
  // A failure is always `{ message }` at its own status, whatever the route.
  if (isErrorSignature(envelope)) {
    const failed = reply
      .status(envelope.status)
      .send({ message: envelope.message });
    return failed;
  }

  // A route that succeeds with no body answers 204 and nothing else.
  if (route.successStatus === 204) {
    const empty = reply.status(204).send();
    return empty;
  }

  if (isDataSignature(envelope)) {
    const payload =
      route.successContentType === jsonContentType
        ? JSON.stringify(envelope.data)
        : envelope.data;

    const sent = reply
      .type(route.successContentType)
      .status(route.successStatus)
      .send(payload);
    return sent;
  }

  return reply;
};

export { sendRouteResult };
