import Fastify from 'fastify';
import type { RegisteredRoute, RouteInvokeResult } from '@ports';
import { sendRouteResult } from './send-route-result';

const jsonRoute: RegisteredRoute = {
  auth: { authRequired: false },
  invoke: async () => ({ success: true, data: undefined }),
  method: 'GET',
  path: '/x',
  successContentType: 'application/json',
  successStatus: 200,
};

/** Answer one request with the given envelope through `sendRouteResult`. */
const inject = async (
  envelope: RouteInvokeResult,
  route: RegisteredRoute = jsonRoute,
): Promise<{ statusCode: number; body: string; contentType: unknown }> => {
  const app = Fastify();
  app.get('/x', (_request, reply) => sendRouteResult(reply, envelope, route));
  const response = await app.inject({ method: 'GET', url: '/x' });
  await app.close();
  return {
    body: response.body,
    contentType: response.headers['content-type'],
    statusCode: response.statusCode,
  };
};

describe('sendRouteResult function', () => {
  it(
    'sends an error as { message } at its status',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const sent = await inject({
        message: 'Nope',
        status: 404,
        success: false,
      });

      expect(sent.statusCode).toBe(404);
      expect(JSON.parse(sent.body)).toStrictEqual({ message: 'Nope' });
    },
  );

  it('sends a bare string id as valid JSON', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const sent = await inject({ data: 'army-1', success: true });

    expect(sent.body).toBe('"army-1"');
  });

  it(
    'sends 204 and no body when the route succeeds without one',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const sent = await inject(
        { success: true },
        { ...jsonRoute, successStatus: 204 },
      );

      expect(sent.statusCode).toBe(204);
      expect(sent.body).toBe('');
    },
  );

  it(
    "sends a media body raw, with the route's content type",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const sent = await inject(
        { data: '<svg/>', success: true },
        { ...jsonRoute, successContentType: 'image/svg+xml' },
      );

      expect(sent.body).toBe('<svg/>');
      expect(String(sent.contentType)).toContain('image/svg+xml');
    },
  );
});
