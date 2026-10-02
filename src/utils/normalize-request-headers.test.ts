import { normalizeRequestHeaders } from './normalize-request-headers';

describe('normalizeRequestHeaders function', () => {
  it(
    'keeps the first value when a header is an array',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const headers = normalizeRequestHeaders({
        authorization: ['Bearer a', 'Bearer b'],
        'x-empty': undefined,
        'x-single': 'one',
      });

      expect(headers).toStrictEqual({
        authorization: 'Bearer a',
        'x-single': 'one',
      });
    },
  );
});
