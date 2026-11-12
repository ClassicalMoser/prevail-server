import { formatVersionTriple } from './format-version-triple';

describe('formatVersionTriple function', () => {
  it(
    'joins the numbers this test set into a dotted version',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // Three distinct numbers, so any swap of major, minor and patch shows.
      const version = formatVersionTriple({ major: 9, minor: 8, patch: 7 });

      expect(version).toBe('9.8.7');
    },
  );
});
