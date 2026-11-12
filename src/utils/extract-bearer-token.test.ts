import { extractBearerToken } from './extract-bearer-token';

describe('extractBearerToken function', () => {
  it(
    'returns undefined when Authorization is missing',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // No Authorization header, so there is no token.
      const token = extractBearerToken({});

      expect(token).toBeUndefined();
    },
  );

  it('reads a Bearer token from Authorization', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // The token is what follows the Bearer scheme.
    const token = extractBearerToken({ authorization: 'Bearer secret-token' });

    expect(token).toBe('secret-token');
  });

  it('rejects a non-Bearer scheme', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // Basic credentials are not a bearer token, so they are not passed on to
    // token verification.
    const token = extractBearerToken({ Authorization: 'Basic abc' });

    expect(token).toBeUndefined();
  });
});
