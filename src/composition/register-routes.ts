import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type {
  AuthPort,
  ErrorSignature,
  RegisteredRoute,
  RouteInvokeResult,
  WireRouteRequest,
} from '@ports';
import { extractBearerToken, isDataSignature, isErrorSignature } from '@utils';

const unauthorized: ErrorSignature = {
  success: false,
  message: 'Unauthorized',
  status: 401,
};

const toRequestHeaders = (
  headers: FastifyRequest['headers'],
): Readonly<Record<string, string | undefined>> => {
  const result: Record<string, string | undefined> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) {
      result[key] = Array.isArray(value) ? value[0] : value;
    }
  }

  return result;
};

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
 */
const sendRouteResult = (
  reply: FastifyReply,
  envelope: RouteInvokeResult,
  route: RegisteredRoute,
): FastifyReply => {
  if (isErrorSignature(envelope)) {
    return reply.status(envelope.status).send({ message: envelope.message });
  }

  if (route.successStatus === 204) {
    return reply.status(204).send();
  }

  if (isDataSignature(envelope)) {
    const payload =
      route.successContentType === jsonContentType
        ? JSON.stringify(envelope.data)
        : envelope.data;

    return reply
      .type(route.successContentType)
      .status(route.successStatus)
      .send(payload);
  }

  return reply;
};

/**
 * Mounts a {@link RouteRegistry} onto a Fastify instance.
 *
 * Each incoming request is adapted into a {@link WireRouteRequest} and passed
 * to the route's `invoke` method. Per-route parsing and typing happen inside
 * `invoke` (via the parser supplied to `defineGetRoute`, etc.), not here.
 * Returned envelopes are inspected and wired to the Fastify response here.
 */
const registerRoutes = (
  app: FastifyInstance,
  routes: readonly RegisteredRoute[],
  authPort: AuthPort,
): void => {
  for (const route of routes) {
    app.route({
      method: route.method,
      url: route.path,
      handler: async (fastifyRequest, fastifyReply) => {
        let wireRequest: WireRouteRequest = {
          params: fastifyRequest.params,
          body: fastifyRequest.body,
          query: fastifyRequest.query,
          headers: toRequestHeaders(fastifyRequest.headers),
        };

        if (route.auth.authRequired) {
          const token = extractBearerToken(wireRequest.headers);
          if (token === undefined) {
            return sendRouteResult(fastifyReply, unauthorized, route);
          }

          const authResult = await authPort.checkToken(token, route.auth);
          if ('success' in authResult) {
            return sendRouteResult(fastifyReply, authResult, route);
          }

          wireRequest = {
            ...wireRequest,
            auth: { subject: authResult.subject },
          };
        }

        const result = await route.invoke(wireRequest);
        return sendRouteResult(fastifyReply, result, route);
      },
    });
  }
};

export { registerRoutes };
