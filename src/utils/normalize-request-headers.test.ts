import { normalizeRequestHeaders } from './normalize-request-headers';

describe('normalizeRequestHeaders function', () => {
  it(
    'keeps the first value when a header is an array',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // Node may hand over a repeated header as an array, and a header may be
      // undefined.
      const headers = normalizeRequestHeaders({
        authorization: ['Bearer a', 'Bearer b'],
        'x-empty': undefined,
        'x-single': 'one',
      });

      // Only the first value is kept for authorization, and the undefined
      // header is dropped, so later code sees plain strings.
      expect(headers).toStrictEqual({
        authorization: 'Bearer a',
        'x-single': 'one',
      });
    },
  );
});
