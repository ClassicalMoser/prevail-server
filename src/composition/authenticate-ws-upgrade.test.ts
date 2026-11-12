import type { AuthPort, RegisteredWsRoute } from '@ports';
import { authenticateWsUpgrade } from './authenticate-ws-upgrade';

const protectedRoute: RegisteredWsRoute = {
  auth: { authRequired: true, permissionsRequired: [] },
  onConnection: async () => {
    /* Unused by this test. */
  },
  path: '/ws/test',
};

const openRoute: RegisteredWsRoute = {
  ...protectedRoute,
  auth: { authRequired: false },
};

const accepting: AuthPort = {
  checkToken: async () => ({ subject: 'auth0|a' }),
};

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
          query: { access_token: 'good' },
          route: protectedRoute,
        }),
      ).resolves.toStrictEqual({ subject: 'auth0|a' });
    },
  );

  it('closes with 1008 when there is no token', { timeout: 5000 }, async () => {
    expect.hasAssertions();

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
          authPort: rejecting,
          close: vi.fn<(code: number, reason: string) => void>(),
          headers: {},
          query: {},
          route: openRoute,
        }),
      ).resolves.toBe('anonymous');
    },
  );
});
