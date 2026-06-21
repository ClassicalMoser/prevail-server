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

/**
 * Maps a handler return envelope to the HTTP wire format.
 *
 * Success with body: raw payload with `successContentType` (JSON or media).
 * Success without body: HTTP 204 only.
 * Error: `{ message }` with `envelope.status`.
 */
const sendRouteResult = (
  reply: FastifyReply,
  envelope: RouteInvokeResult,
  route: RegisteredRoute,
): unknown => {
  if (isErrorSignature(envelope)) {
    reply.status(envelope.status).send({ message: envelope.message });
    return envelope;
  }

  if (route.successStatus === 204) {
    reply.status(204).send();
    return envelope;
  }

  if (isDataSignature(envelope)) {
    reply
      .type(route.successContentType)
      .status(route.successStatus)
      .send(envelope.data);
  }

  return envelope;
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
        const wireRequest: WireRouteRequest = {
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
          if (authResult !== true) {
            return sendRouteResult(fastifyReply, authResult, route);
          }
        }

        const result = await route.invoke(wireRequest);
        return sendRouteResult(fastifyReply, result, route);
      },
    });
  }
};

export { registerRoutes };
