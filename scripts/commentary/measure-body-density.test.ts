import { measureBodyDensity } from './measure-body-density';

// The line holding a body's closing brace starts inside the body, so it counts
// as one code line; each text below ends with one.
describe('measureBodyDensity function', () => {
  it(
    'counts a comment and a code line inside a body',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // One comment and one code line inside a body.
      const text = ['const f = () => {', '  // why', '  work();', '};'].join(
        '\n',
      );

      expect(measureBodyDensity(text)).toStrictEqual({ code: 2, comments: 1 });
    },
  );

  it('does not count the JSDoc above a declaration', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // A JSDoc block sits above the declaration, outside its body.
    const text = [
      '/**',
      ' * What it is.',
      ' */',
      'const f = () => {',
      '  work();',
      '};',
    ].join('\n');

    // The JSDoc is not counted: the closing brace and the call are the two code
    // lines.
    expect(measureBodyDensity(text)).toStrictEqual({ code: 2, comments: 0 });
  });

  it(
    "counts a struct member's JSDoc, which sits inside the struct body",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const text = [
        // A member's doc comment sits inside the interface's braces, so it is
        // body commentary.
        'interface A {',
        '  /** What b is. */',
        '  b: string;',
        '}',
      ].join('\n');

      expect(measureBodyDensity(text)).toStrictEqual({ code: 2, comments: 1 });
    },
  );

  it('counts blank lines in neither', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // Blank lines inside the body.
    const text = ['const f = () => {', '', '  work();', '', '};'].join('\n');

    // Blanks add to neither side.
    expect(measureBodyDensity(text)).toStrictEqual({ code: 2, comments: 0 });
  });
});
