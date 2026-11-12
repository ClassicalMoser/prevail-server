import type { AuthPort, RegisteredWsRoute } from '@ports';
import { authenticateWsUpgrade } from './authenticate-ws-upgrade';

// A socket route that requires a token.
const protectedRoute: RegisteredWsRoute = {
  auth: { authRequired: true, permissionsRequired: [] },
  onConnection: async () => {
    /* Unused by this test. */
  },
  path: '/ws/test',
};

// The same route with auth turned off.
const openRoute: RegisteredWsRoute = {
  ...protectedRoute,
  auth: { authRequired: false },
};

// An auth port that accepts any token as the player auth0|a.
const accepting: AuthPort = {
  checkToken: async () => ({ subject: 'auth0|a' }),
};

// An auth port that refuses the token as expired.
const rejecting: AuthPort = {
  checkToken: async () => ({
    message: 'Token expired',
    status: 401,
    success: false,
  }),
};

describe('authenticateWsUpgrade function', () => {
  it(
    'answers the subject of a verified header token',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      await expect(
        authenticateWsUpgrade({
          authPort: accepting,
          close: vi.fn<(code: number, reason: string) => void>(),
          // A non-browser client sends the token in the Authorization header.
          headers: { authorization: 'Bearer good' },
          query: {},
          route: protectedRoute,
        }),
      ).resolves.toStrictEqual({ subject: 'auth0|a' });
    },
  );

  it(
    'accepts the token from the query for a browser client',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      await expect(
        authenticateWsUpgrade({
          authPort: accepting,
          close: vi.fn<(code: number, reason: string) => void>(),
          headers: {},
          // A browser cannot set Authorization on a socket, so the token rides
          // in the query.
          query: { access_token: 'good' },
          route: protectedRoute,
        }),
      ).resolves.toStrictEqual({ subject: 'auth0|a' });
    },
  );

  it('closes with 1008 when there is no token', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    // close is a spy: the upgrade must be closed, not left open and
    // unauthenticated.
    const close = vi.fn<(code: number, reason: string) => void>();

    await expect(
      authenticateWsUpgrade({
        authPort: accepting,
        close,
        headers: {},
        query: {},
        route: protectedRoute,
      }),
    ).resolves.toBe('closed');
    // No token closes with 1008, the policy-violation code.
    expect(close).toHaveBeenCalledWith(1008, 'Unauthorized');
  });

  it(
    "closes with the auth port's reason when the token is refused",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const close = vi.fn<(code: number, reason: string) => void>();

      await expect(
        authenticateWsUpgrade({
          authPort: rejecting,
          close,
          headers: { authorization: 'Bearer bad' },
          query: {},
          route: protectedRoute,
        }),
      ).resolves.toBe('closed');
      // The auth port's reason is the close reason.
      expect(close).toHaveBeenCalledWith(1008, 'Token expired');
    },
  );

  it(
    'lets anyone connect to a route that needs no auth',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      await expect(
        authenticateWsUpgrade({
          // Even a port that would refuse is not asked: an open route has no
          // token to check.
          authPort: rejecting,
          close: vi.fn<(code: number, reason: string) => void>(),
          headers: {},
          query: {},
          route: openRoute,
        }),
        // The connection is let in with no subject.
      ).resolves.toBe('anonymous');
    },
  );
});
