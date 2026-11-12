import Fastify from 'fastify';
import type { AuthPort, RegisteredRoute } from '@ports';
import { registerHttp } from './register-http';

// An auth port that accepts any token.
const allowAllAuth: AuthPort = {
  checkToken: async () => ({ subject: 'test-subject' }),
};

// A public GET route that answers { ok: true }.
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
      // The registry is registered on a bare Fastify app and the route is then
      // called with inject, with no port opened.
      registerHttp(app, allowAllAuth, [route]);

      const response = await app.inject({
        method: 'GET',
        url: '/health-check-stub',
      });

      expect(response.statusCode).toBe(200);
      // The route's data is the response body.
      expect(response.json()).toStrictEqual({ ok: true });
    },
  );
});
