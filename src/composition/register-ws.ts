import type { FastifyInstance } from 'fastify';
import websocket from '@fastify/websocket';
import type { AuthPort, WsRouteRegistry } from '@ports';
import { extractAccessToken, normalizeRequestHeaders } from '@utils';

const rawToText = (raw: Buffer | ArrayBuffer | Buffer[]): string => {
  if (Buffer.isBuffer(raw)) {
    return raw.toString('utf8');
  }
  if (Array.isArray(raw)) {
    return Buffer.concat(raw).toString('utf8');
  }
  return Buffer.from(raw).toString('utf8');
};

interface SeatAuth {
  subject: string;
}

const authenticateUpgrade = async (input: {
  authPort: AuthPort;
  headers: Readonly<Record<string, string | undefined>>;
  query: Record<string, string | string[] | undefined>;
  route: WsRouteRegistry[number];
  close: (code: number, reason: string) => void;
}): Promise<SeatAuth | 'closed' | 'anonymous'> => {
  if (!input.route.auth.authRequired) {
    return 'anonymous';
  }
  const token = extractAccessToken(input.headers, input.query);
  if (token === undefined) {
    input.close(1008, 'Unauthorized');
    return 'closed';
  }
  const authResult = await input.authPort.checkToken(token, input.route.auth);
  if ('success' in authResult) {
    input.close(1008, authResult.message);
    return 'closed';
  }
  return { subject: authResult.subject };
};

/**
 * Registers `@fastify/websocket` and mounts contract-driven WS routes.
 */
const registerWs = async (
  app: FastifyInstance,
  authPort: AuthPort,
  routes: WsRouteRegistry,
): Promise<void> => {
  await app.register(websocket);

  for (const route of routes) {
    app.get(route.path, { websocket: true }, async (socket, request) => {
      const headers = normalizeRequestHeaders(
        request.headers as Record<string, string | string[] | undefined>,
      );

      const authOutcome = await authenticateUpgrade({
        authPort,
        close: (code, reason) => {
          socket.close(code, reason);
        },
        headers,
        query: request.query as Record<string, string | string[] | undefined>,
        route,
      });
      if (authOutcome === 'closed') {
        return;
      }
      const auth = authOutcome === 'anonymous' ? undefined : authOutcome;

      const messageHandlers: ((raw: string) => void)[] = [];
      const closeHandlers: (() => void)[] = [];

      socket.on('message', (raw: Buffer | ArrayBuffer | Buffer[]) => {
        const text = rawToText(raw);
        for (const handler of messageHandlers) {
          handler(text);
        }
      });

      socket.on('close', () => {
        for (const handler of closeHandlers) {
          handler();
        }
      });

      await route.onConnection(
        {
          auth,
          headers,
          params: request.params,
        },
        {
          close: (code, reason) => {
            socket.close(code, reason);
          },
          onClose: (handler) => {
            closeHandlers.push(handler);
          },
          onMessage: (handler) => {
            messageHandlers.push(handler);
          },
          send: (data) => {
            socket.send(data);
          },
        },
      );
    });
  }
};

export { registerWs };
