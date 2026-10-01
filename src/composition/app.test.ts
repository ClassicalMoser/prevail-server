import { app, configureApp } from './app';

const CLIENT_ORIGIN = 'http://localhost:1420';

describe('cors', () => {
  beforeAll(async () => {
    await configureApp();
  });

  it(
    'allows DELETE preflight for authenticated delete-empty routes',
    { timeout: 10_000 },
    async () => {
      expect.hasAssertions();

      const response = await app.inject({
        method: 'OPTIONS',
        url: '/command-cards/empty',
        headers: {
          origin: CLIENT_ORIGIN,
          'access-control-request-method': 'DELETE',
          'access-control-request-headers': 'authorization',
        },
      });

      expect(response.statusCode).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBe(
        CLIENT_ORIGIN,
      );
      expect(response.headers['access-control-allow-methods']).toContain(
        'DELETE',
      );
      expect(response.headers['access-control-allow-headers']).toContain(
        'Authorization',
      );
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    },
  );

  it(
    'allows POST preflight for JSON routes with authorization',
    { timeout: 10_000 },
    async () => {
      expect.hasAssertions();

      const response = await app.inject({
        method: 'OPTIONS',
        url: '/command-cards/by-ids',
        headers: {
          origin: CLIENT_ORIGIN,
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'authorization, content-type',
        },
      });

      expect(response.statusCode).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBe(
        CLIENT_ORIGIN,
      );
      expect(response.headers['access-control-allow-methods']).toContain(
        'POST',
      );
      expect(response.headers['access-control-allow-headers']).toContain(
        'Content-Type',
      );
    },
  );
});
