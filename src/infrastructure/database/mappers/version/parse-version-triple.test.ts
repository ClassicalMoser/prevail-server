import { parseVersionTriple } from './parse-version-triple';

describe('parseVersionTriple function', () => {
  it('splits a dotted triple into numbers', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // Distinct numbers again, so a swapped field would fail.
    const triple = parseVersionTriple('2.3.4');

    expect(triple).toStrictEqual({ major: 2, minor: 3, patch: 4 });
  });
});
