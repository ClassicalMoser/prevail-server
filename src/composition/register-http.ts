import type { FastifyInstance } from 'fastify';
import type { AuthPort, RouteRegistry } from '@ports';
import { registerRoutes } from './register-routes';

const registerHttp = (
  app: FastifyInstance,
  authPort: AuthPort,
  routes: RouteRegistry,
): void => {
  registerRoutes(app, routes, authPort);
};

export { registerHttp };
