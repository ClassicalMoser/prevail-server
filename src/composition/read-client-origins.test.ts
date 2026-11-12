import { readClientOrigins } from './read-client-origins';

describe('readClientOrigins function', () => {
  it('splits and trims a comma-separated list', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(
      readClientOrigins('https://a.example , https://b.example'),
    ).toStrictEqual(['https://a.example', 'https://b.example']);
  });

  it('drops blank entries', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(readClientOrigins('https://a.example,, ')).toStrictEqual([
      'https://a.example',
    ]);
  });

  it(
    'falls back to the local and production origins when unset',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      expect(readClientOrigins(undefined)).toContain(
        'https://app.prevailgame.com',
      );
    },
  );
});
