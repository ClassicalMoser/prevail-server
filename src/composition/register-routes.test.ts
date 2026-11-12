import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import type { AuthPort, RegisteredRoute } from '@ports';
import { registerRoutes } from './register-routes';

// An auth port that accepts any token.
const allowAllAuth: AuthPort = {
  checkToken: async () => ({ subject: 'test-subject' }),
};

// Builds a bare Fastify app with one route registered, so each case sees only
// the serialization.
const buildApp = (route: RegisteredRoute): FastifyInstance => {
  const app = Fastify();
  registerRoutes(app, [route], allowAllAuth);
  return app;
};

// A public POST route answering 201 with JSON; cases override what they need.
const baseRoute = {
  method: 'POST' as const,
  path: '/resource',
  auth: { authRequired: false } as RegisteredRoute['auth'], // partial auth object; the test only checks authRequired
  successStatus: 201 as const,
  successContentType: 'application/json' as const,
};

describe('registerRoutes JSON serialization', () => {
  it(
    'sends a bare string payload as valid JSON',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // A uuid-shaped string stands for the id a create route returns.
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const app = buildApp({
        ...baseRoute,
        invoke: async () => ({ success: true, data: id }),
      });

      const response = await app.inject({ method: 'POST', url: '/resource' });

      expect(response.statusCode).toBe(201);
      expect(response.headers['content-type']).toContain('application/json');
      // A bare string, which is not JSON on its own, comes back as a quoted
      // JSON string that parses to the id.
      expect(JSON.parse(response.body)).toBe(id);

      await app.close();
    },
  );

  it('sends an object payload as valid JSON', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const app = buildApp({
      ...baseRoute,
      // An object payload with status 200.
      successStatus: 200,
      invoke: async () => ({ success: true, data: { id: 'x' } }),
    });

    const response = await app.inject({ method: 'POST', url: '/resource' });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toStrictEqual({ id: 'x' });

    await app.close();
  });

  it(
    'sends raw media payloads without JSON wrapping',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // A rendered card image as text.
      const svg = '<svg></svg>';
      const app = buildApp({
        ...baseRoute,
        successStatus: 200,
        // A media route declares its content type.
        successContentType: 'image/svg+xml',
        invoke: async () => ({ success: true, data: svg }),
      });

      const response = await app.inject({ method: 'POST', url: '/resource' });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('image/svg+xml');
      // The image is sent as is, not wrapped in quotes as JSON.
      expect(response.body).toBe(svg);

      await app.close();
    },
  );
});
