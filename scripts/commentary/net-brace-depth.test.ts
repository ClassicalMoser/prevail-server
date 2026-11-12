import { netBraceDepth } from './net-brace-depth';

describe('netBraceDepth function', () => {
  it('counts a brace that opens a body', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(netBraceDepth('const f = () => {')).toBe(1);
  });

  it('counts a brace that closes a body', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(netBraceDepth('};')).toBe(-1);
  });

  it('ignores a brace inside a string', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(netBraceDepth("const label = '{E-5}';")).toBe(0);
  });

  it('ignores a brace in a trailing comment', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(netBraceDepth('run(); // opens a { in prose')).toBe(0);
  });
});
