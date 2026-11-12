import { readWsQuery } from './read-ws-query';

describe('readWsQuery function', () => {
  it('keeps strings and arrays of strings', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // Strings and arrays of strings are the only shapes a plain query string
    // produces.
    expect(readWsQuery({ access_token: 'abc', tag: ['a', 'b'] })).toStrictEqual(
      {
        access_token: 'abc',
        tag: ['a', 'b'],
      },
    );
  });

  it(
    'drops a value a client could nest into the URL',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      expect(
        // A nested object or a mixed array can only come from a crafted URL; it
        // is dropped rather than passed on, so the token reader never sees a
        // non-string.
        readWsQuery({ access_token: { evil: true }, tag: ['a', 1] }),
      ).toStrictEqual({});
    },
  );

  it(
    'answers nothing for a query that is not an object',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // A missing query is treated as empty.
      expect(readWsQuery(null)).toStrictEqual({});
    },
  );
});
