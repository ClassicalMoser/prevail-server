import type { FastifyInstance } from 'fastify';
import type { AuthPort, RegisteredWsRoute } from '@ports';
import { normalizeRequestHeaders } from '@utils';
import { adaptWsSocket } from './adapt-ws-socket';
import { authenticateWsUpgrade } from './authenticate-ws-upgrade';
import { readWsQuery } from './read-ws-query';

/**
 * Serve one socket route on Fastify.
 *
 * Each upgrade is authenticated first, so a refused client is closed before
 * the route (and so any game) hears of it. An accepted client is handed to the
 * route with its params, headers and verified caller.
 *
 * @param app - Fastify instance with the websocket plugin registered.
 * @param authPort - Token check used during upgrade.
 * @param route - The route to serve.
 */
const mountWsRoute = (
  app: FastifyInstance,
  authPort: AuthPort,
  route: RegisteredWsRoute,
): void => {
  app.get(route.path, { websocket: true }, async (socket, request) => {
    // One string per header, so the token and any other header read as a single value.
    const headers = normalizeRequestHeaders(request.headers);

    const authOutcome = await authenticateWsUpgrade({
      authPort,
      close: (code, reason) => {
        socket.close(code, reason);
      },
      headers,
      query: readWsQuery(request.query),
      route,
    });
    // The socket is already closed with 1008; no game code runs for a refused client.
    if (authOutcome === 'closed') {
      return;
    }
    // A route with no auth requirement has no caller; a route with one always has a
    // verified subject by this point.
    const auth = authOutcome === 'anonymous' ? undefined : authOutcome;

    // Params go on unparsed; the route checks them against the contract schema
    // before admitting the client.
    await route.onConnection(
      { auth, headers, params: request.params },
      adaptWsSocket(socket),
    );
  });
};

export { mountWsRoute };
