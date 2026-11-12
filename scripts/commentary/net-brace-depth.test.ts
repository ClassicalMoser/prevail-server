import { netBraceDepth } from './net-brace-depth';

describe('netBraceDepth function', () => {
  it('counts a brace that opens a body', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // An opening brace deepens the body by one.
    expect(netBraceDepth('const f = () => {')).toBe(1);
  });

  it('counts a brace that closes a body', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // A closing brace leaves the body.
    expect(netBraceDepth('};')).toBe(-1);
  });

  it('ignores a brace inside a string', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // A brace inside a string literal is text, not structure.
    expect(netBraceDepth("const label = '{E-5}';")).toBe(0);
  });

  it('ignores a brace in a trailing comment', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // A brace in a trailing comment is prose, not structure.
    expect(netBraceDepth('run(); // opens a { in prose')).toBe(0);
  });
});
