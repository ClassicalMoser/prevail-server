import Fastify from 'fastify';
import type { AuthPort, RegisteredWsRoute } from '@ports';
import { WebSocket } from 'ws';
import { registerWs } from './register-ws';

const allowAllAuth: AuthPort = {
  checkToken: async () => ({ subject: 'test-subject' }),
};

const denyAuth: AuthPort = {
  checkToken: async () => ({
    message: 'Unauthorized',
    status: 401,
    success: false,
  }),
};

const listen = async (
  app: ReturnType<typeof Fastify>,
): Promise<{ port: number; close: () => Promise<void> }> => {
  await app.listen({ port: 0, host: '127.0.0.1' });
  const address = app.server.address();
  if (address === null || typeof address === 'string') {
    throw new Error('Expected TCP address');
  }
  return {
    close: async () => {
      await app.close();
    },
    port: address.port,
  };
};

describe('websocket route registration', () => {
  it(
    'rejects upgrade when auth fails',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const route: RegisteredWsRoute = {
        auth: {
          authRequired: true,
          permissionsRequired: ['game:play'],
        },
        onConnection: async () => {
          /* No-op */
        },
        path: '/ws/test',
        side: 'white',
      };

      const app = Fastify();
      await registerWs(app, denyAuth, [route]);
      const server = await listen(app);

      const closed = await new Promise<{ code: number }>((resolve, reject) => {
        const ws = new WebSocket(`ws://127.0.0.1:${server.port}/ws/test`, {
          headers: { authorization: 'Bearer bad' },
        });
        ws.on('close', (code) => {
          resolve({ code });
        });
        ws.on('error', reject);
      });

      expect(closed.code).toBe(1008);
      await server.close();
    },
  );

  it(
    'accepts authenticated upgrade and delivers a message',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const route: RegisteredWsRoute = {
        auth: {
          authRequired: true,
          permissionsRequired: ['game:play'],
        },
        onConnection: async (_wire, socket) => {
          socket.send(
            JSON.stringify({
              payload: { ok: true },
              type: 'roundSnapshot',
            }),
          );
        },
        path: '/ws/test',
        side: 'white',
      };

      const app = Fastify();
      await registerWs(app, allowAllAuth, [route]);
      const server = await listen(app);

      const message = await new Promise<string>((resolve, reject) => {
        const ws = new WebSocket(`ws://127.0.0.1:${server.port}/ws/test`, {
          headers: { authorization: 'Bearer good' },
        });
        ws.on('message', (data) => {
          resolve(data.toString());
          ws.close();
        });
        ws.on('error', reject);
      });

      expect(JSON.parse(message)).toStrictEqual({
        payload: { ok: true },
        type: 'roundSnapshot',
      });
      await server.close();
    },
  );

  it(
    'accepts access_token query on upgrade (browser WebSocket auth)',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const route: RegisteredWsRoute = {
        auth: {
          authRequired: true,
          permissionsRequired: ['game:play'],
        },
        onConnection: async (_wire, socket) => {
          socket.send(
            JSON.stringify({
              payload: { ok: true },
              type: 'roundSnapshot',
            }),
          );
        },
        path: '/ws/test-query',
        side: 'white',
      };

      const app = Fastify();
      await registerWs(app, allowAllAuth, [route]);
      const server = await listen(app);

      const message = await new Promise<string>((resolve, reject) => {
        const ws = new WebSocket(
          `ws://127.0.0.1:${server.port}/ws/test-query?access_token=good`,
        );
        ws.on('message', (data) => {
          resolve(data.toString());
          ws.close();
        });
        ws.on('error', reject);
      });

      expect(JSON.parse(message)).toStrictEqual({
        payload: { ok: true },
        type: 'roundSnapshot',
      });
      await server.close();
    },
  );
});