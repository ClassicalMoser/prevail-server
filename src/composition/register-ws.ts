import type { FastifyInstance } from 'fastify';
import websocket from '@fastify/websocket';
import type { AuthPort, WsRouteRegistry } from '@ports';
import { mountWsRoute } from './mount-ws-route';

/**
 * Register the WebSocket plugin and one Fastify route per socket route.
 *
 * Upgrade auth uses the Authorization header when a client can set it, and
 * `access_token` in the query when it cannot. A failed check closes the
 * socket with 1008 before seat handlers run.
 *
 * @param app - Fastify instance.
 * @param authPort - Token check used during upgrade.
 * @param routes - Socket routes from the contract registry.
 */
const registerWs = async (
  app: FastifyInstance,
  authPort: AuthPort,
  routes: WsRouteRegistry,
): Promise<void> => {
  // Must come before any route declares { websocket: true }.
  await app.register(websocket);

  for (const route of routes) {
    mountWsRoute(app, authPort, route);
  }
};

export { registerWs };
