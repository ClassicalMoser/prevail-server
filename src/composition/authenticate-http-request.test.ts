import type { AuthRequired } from '@classicalmoser/prevail-contracts';
import type { AuthPort } from '@ports';
import { authenticateHttpRequest } from './authenticate-http-request';

const auth: AuthRequired = { authRequired: true, permissionsRequired: [] };

const accepting: AuthPort = {
  checkToken: async () => ({ subject: 'auth0|a' }),
};

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
