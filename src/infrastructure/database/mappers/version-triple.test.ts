import { formatVersionTriple } from './format-version-triple';
import { parseVersionTriple } from './parse-version-triple';

describe('parseVersionTriple function', () => {
  it('splits a dotted triple into numbers', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const triple = parseVersionTriple('2.3.4');

    expect(triple).toStrictEqual({ major: 2, minor: 3, patch: 4 });
  });
});

describe('formatVersionTriple function', () => {
  it(
    'joins the numbers this test set into a dotted version',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const version = formatVersionTriple({ major: 9, minor: 8, patch: 7 });

      expect(version).toBe('9.8.7');
    },
  );
});
