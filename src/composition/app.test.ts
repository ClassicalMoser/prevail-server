import { app, configureApp } from './app';

// The browser client's local dev origin, one of the origins the server allows
// by default.
const CLIENT_ORIGIN = 'http://localhost:1420';

describe('cors', () => {
  // The routes and CORS are registered once; every case injects requests
  // without opening a port.
  beforeAll(async () => {
    await configureApp();
  });

  it(
    'allows DELETE preflight for authenticated delete-empty routes',
    { timeout: 10_000 },
    async () => {
      expect.hasAssertions();

      const response = await app.inject({
        // A browser sends this preflight before a cross-origin DELETE that
        // carries an Authorization header.
        method: 'OPTIONS',
        url: '/command-cards/empty',
        headers: {
          origin: CLIENT_ORIGIN,
          'access-control-request-method': 'DELETE',
          'access-control-request-headers': 'authorization',
        },
      });

      // The preflight succeeds with no body.
      expect(response.statusCode).toBe(204);
      // The client's origin is echoed back, not a wildcard, because credentials
      // are allowed.
      expect(response.headers['access-control-allow-origin']).toBe(
        CLIENT_ORIGIN,
      );
      // DELETE is allowed, or the browser would refuse to send the delete.
      expect(response.headers['access-control-allow-methods']).toContain(
        'DELETE',
      );
      // Authorization is allowed, or the browser would drop the token.
      expect(response.headers['access-control-allow-headers']).toContain(
        'Authorization',
      );
      // Credentials are allowed for the allowed origin.
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    },
  );

  it(
    'allows POST preflight for JSON routes with authorization',
    { timeout: 10_000 },
    async () => {
      expect.hasAssertions();

      const response = await app.inject({
        // The same preflight for a POST with a JSON body, asking to send
        // authorization and content-type.
        method: 'OPTIONS',
        url: '/command-cards/by-ids',
        headers: {
          origin: CLIENT_ORIGIN,
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'authorization, content-type',
        },
      });

      // The preflight succeeds with no body.
      expect(response.statusCode).toBe(204);
      // The client's origin is echoed back.
      expect(response.headers['access-control-allow-origin']).toBe(
        CLIENT_ORIGIN,
      );
      // POST is allowed.
      expect(response.headers['access-control-allow-methods']).toContain(
        'POST',
      );
      // Content-Type is allowed, or a JSON POST would be blocked by the
      // browser.
      expect(response.headers['access-control-allow-headers']).toContain(
        'Content-Type',
      );
    },
  );
});
