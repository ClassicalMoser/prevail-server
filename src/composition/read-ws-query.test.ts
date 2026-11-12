import { readWsQuery } from './read-ws-query';

describe('readWsQuery function', () => {
  it('keeps strings and arrays of strings', { timeout: 5000 }, () => {
    expect.hasAssertions();

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
        readWsQuery({ access_token: { evil: true }, tag: ['a', 1] }),
      ).toStrictEqual({});
    },
  );

  it(
    'answers nothing for a query that is not an object',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      expect(readWsQuery(null)).toStrictEqual({});
    },
  );
});
