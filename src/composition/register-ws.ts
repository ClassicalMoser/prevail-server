import type { FastifyInstance } from 'fastify';
import websocket from '@fastify/websocket';
import type { AuthPort, WsRouteRegistry } from '@ports';
import { extractAccessToken } from '@utils';

const toRequestHeaders = (
  headers: Record<string, string | string[] | undefined>,
): Readonly<Record<string, string | undefined>> => {
  const result: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) {
      result[key] = Array.isArray(value) ? value[0] : value;
    }
  }
  return result;
};

const rawToText = (raw: Buffer | ArrayBuffer | Buffer[]): string => {
  if (Buffer.isBuffer(raw)) {
    return raw.toString('utf8');
  }
  if (Array.isArray(raw)) {
    return Buffer.concat(raw).toString('utf8');
  }
  return Buffer.from(raw).toString('utf8');
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
      const headers = toRequestHeaders(
        request.headers as Record<string, string | string[] | undefined>,
      );

      let auth: { subject: string } | undefined = undefined;
      if (route.auth.authRequired) {
        const query = request.query as Record<
          string,
          string | string[] | undefined
        >;
        const token = extractAccessToken(headers, query);
        if (token === undefined) {
          socket.close(1008, 'Unauthorized');
          return;
        }
        const authResult = await authPort.checkToken(token, route.auth);
        if ('success' in authResult) {
          socket.close(1008, authResult.message);
          return;
        }
        auth = { subject: authResult.subject };
      }

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
