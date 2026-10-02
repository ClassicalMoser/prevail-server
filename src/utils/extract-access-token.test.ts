import { extractAccessToken } from './extract-access-token';

describe('extractAccessToken function', () => {
  it(
    'prefers a Bearer Authorization header over the query',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const token = extractAccessToken(
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
        { access_token: ['first', 'second'] },
      );

      expect(token).toBe('first');
    },
  );
});
