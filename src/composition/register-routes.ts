import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type {
  AuthPort,
  ErrorSignature,
  RouteInvokeResult,
  RouteRegistry,
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
 * Success with body: raw payload only, status from `successStatus` (200 or 201).
 * Success without body: HTTP 204 only.
 * Error: `{ message }` with `envelope.status`.
 */
const sendEnvelope = (
  reply: FastifyReply,
  envelope: RouteInvokeResult,
  successStatus: 200 | 201 | 204,
): unknown => {
  if (isErrorSignature(envelope)) {
    reply.status(envelope.status).send({ message: envelope.message });
    return envelope;
  }

  if (successStatus === 204) {
    reply.status(204).send();
    return envelope;
  }

  if (isDataSignature(envelope)) {
    reply.status(successStatus).send(envelope.data);
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
  routes: RouteRegistry,
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
            return sendEnvelope(
              fastifyReply,
              unauthorized,
              route.successStatus,
            );
          }

          const authResult = await authPort.checkToken(token, route.auth);
          if (authResult !== true) {
            return sendEnvelope(fastifyReply, authResult, route.successStatus);
          }
        }

        const result = await route.invoke(wireRequest);
        return sendEnvelope(fastifyReply, result, route.successStatus);
      },
    });
  }
};

export { registerRoutes };
