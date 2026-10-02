import { extractBearerToken } from './extract-bearer-token';

describe('extractBearerToken function', () => {
  it(
    'returns undefined when Authorization is missing',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const token = extractBearerToken({});

      expect(token).toBeUndefined();
    },
  );

  it('reads a Bearer token from Authorization', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const token = extractBearerToken({ authorization: 'Bearer secret-token' });

    expect(token).toBe('secret-token');
  });

  it('rejects a non-Bearer scheme', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const token = extractBearerToken({ Authorization: 'Basic abc' });

    expect(token).toBeUndefined();
  });
});
