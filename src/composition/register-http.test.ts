import Fastify from 'fastify';
import type { AuthPort, RegisteredRoute } from '@ports';
import { registerHttp } from './register-http';

const allowAllAuth: AuthPort = {
  checkToken: async () => ({ subject: 'test-subject' }),
};

const route: RegisteredRoute = {
  auth: { authRequired: false },
  invoke: async () => ({ data: { ok: true }, success: true }),
  method: 'GET',
  path: '/health-check-stub',
  successContentType: 'application/json',
  successStatus: 200,
};

describe('registerHttp function', () => {
  it(
    'registers the HTTP route registry on the Fastify app',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const app = Fastify();
      registerHttp(app, allowAllAuth, [route]);

      const response = await app.inject({
        method: 'GET',
        url: '/health-check-stub',
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toStrictEqual({ ok: true });
    },
  );
});
