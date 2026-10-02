import type { FastifyInstance } from 'fastify';
import type { AuthPort, RouteRegistry } from '@ports';
import { registerRoutes } from './register-routes';

/**
 * Attach the HTTP route registry to a Fastify instance with auth.
 *
 * Thin composition glue so `app.ts` does not import register-routes directly.
 *
 * @param app - Fastify instance receiving the routes.
 * @param authPort - Auth adapter used by protected routes.
 * @param routes - Built route registry from the interface layer.
 * @returns Nothing; registration is side-effectful on `app`.
 */
const registerHttp = (
  app: FastifyInstance,
  authPort: AuthPort,
  routes: RouteRegistry,
): void => {
  registerRoutes(app, routes, authPort);
};

export { registerHttp };
