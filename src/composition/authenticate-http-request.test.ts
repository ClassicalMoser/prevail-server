import type { AuthRequired } from '@classicalmoser/prevail-contracts';
import type { AuthPort } from '@ports';
import { authenticateHttpRequest } from './authenticate-http-request';

// A route that needs a token and no particular permission.
const auth: AuthRequired = { authRequired: true, permissionsRequired: [] };

// An auth port that accepts any token as the player auth0|a.
const accepting: AuthPort = {
  checkToken: async () => ({ subject: 'auth0|a' }),
};

// An auth port that refuses with 403, as when the token lacks a permission.
const rejecting: AuthPort = {
  checkToken: async () => ({
    message: 'Missing permission',
    status: 403,
    success: false,
  }),
};

describe('authenticateHttpRequest function', () => {
  it('answers the subject of a verified token', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    await expect(
      // A bearer token in the Authorization header.
      authenticateHttpRequest(accepting, auth, {
        authorization: 'Bearer good',
      }),
    ).resolves.toStrictEqual({ subject: 'auth0|a' });
  });

  it(
    'answers 401 when there is no bearer token',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      await expect(
        // No Authorization header at all: the port is not even asked, and the
        // answer is 401.
        authenticateHttpRequest(accepting, auth, {}),
      ).resolves.toStrictEqual({
        message: 'Unauthorized',
        status: 401,
        success: false,
      });
    },
  );

  it(
    "answers the auth port's own error when it refuses the token",
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      await expect(
        // The port's own status and message come through, so the player sees
        // 403 rather than a generic 401.
        authenticateHttpRequest(rejecting, auth, {
          authorization: 'Bearer bad',
        }),
      ).resolves.toStrictEqual({
        message: 'Missing permission',
        status: 403,
        success: false,
      });
    },
  );
});
