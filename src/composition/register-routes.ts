import type { FastifyInstance } from 'fastify';
import type { AuthPort, RegisteredRoute, WireRouteRequest } from '@ports';
import { normalizeRequestHeaders } from '@utils';
import { authenticateHttpRequest } from './authenticate-http-request';
import { sendRouteResult } from './send-route-result';

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
          headers: normalizeRequestHeaders(fastifyRequest.headers),
        };

        // A route that needs auth is refused before its handler runs.
        if (route.auth.authRequired) {
          const caller = await authenticateHttpRequest(
            authPort,
            route.auth,
            wireRequest.headers,
          );
          if ('success' in caller) {
            const sentRefusal = sendRouteResult(fastifyReply, caller, route);
            return sentRefusal;
          }
          wireRequest = { ...wireRequest, auth: caller };
        }

        const result = await route.invoke(wireRequest);
        const sent = sendRouteResult(fastifyReply, result, route);
        return sent;
      },
    });
  }
};

export { registerRoutes };
