import { extractAccessToken } from './extract-access-token';

describe('extractAccessToken function', () => {
  it(
    'prefers a Bearer Authorization header over the query',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const token = extractAccessToken(
        // Both sources are present: the header wins, so a stray query value
        // cannot replace the real token.
        { authorization: 'Bearer from-header' },
        { access_token: 'from-query' },
      );

      expect(token).toBe('from-header');
    },
  );

  it(
    'falls back to access_token on the query string',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // A browser socket cannot set headers, so the token arrives in the query.
      const token = extractAccessToken({}, { access_token: 'from-query' });

      expect(token).toBe('from-query');
    },
  );

  it(
    'uses the first access_token when the query value is an array',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const token = extractAccessToken(
        {},
        // A repeated query key arrives as an array; only the first is read.
        { access_token: ['first', 'second'] },
      );

      expect(token).toBe('first');
    },
  );
});
