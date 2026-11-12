import { readClientOrigins } from './read-client-origins';

describe('readClientOrigins function', () => {
  it('splits and trims a comma-separated list', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(
      // A hand-written setting with spaces around the comma.
      readClientOrigins('https://a.example , https://b.example'),
    ).toStrictEqual(['https://a.example', 'https://b.example']);
  });

  it('drops blank entries', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // A trailing comma and a blank entry must not become an allowed origin.
    expect(readClientOrigins('https://a.example,, ')).toStrictEqual([
      'https://a.example',
    ]);
  });

  it(
    'falls back to the local and production origins when unset',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // With no setting, the local dev origin and the production app are
      // allowed.
      expect(readClientOrigins(undefined)).toContain(
        'https://app.prevailgame.com',
      );
    },
  );
});
