import { measureBodyDensity } from './measure-body-density';

// The line holding a body's closing brace starts inside the body, so it counts
// as one code line; each text below ends with one.
describe('measureBodyDensity function', () => {
  it(
    'counts a comment and a code line inside a body',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const text = ['const f = () => {', '  // why', '  work();', '};'].join(
        '\n',
      );

      expect(measureBodyDensity(text)).toStrictEqual({ code: 2, comments: 1 });
    },
  );

  it('does not count the JSDoc above a declaration', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const text = [
      '/**',
      ' * What it is.',
      ' */',
      'const f = () => {',
      '  work();',
      '};',
    ].join('\n');

    expect(measureBodyDensity(text)).toStrictEqual({ code: 2, comments: 0 });
  });

  it(
    "counts a struct member's JSDoc, which sits inside the struct body",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const text = [
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

    const text = ['const f = () => {', '', '  work();', '', '};'].join('\n');

    expect(measureBodyDensity(text)).toStrictEqual({ code: 2, comments: 0 });
  });
});
