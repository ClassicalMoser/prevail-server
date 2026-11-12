import { reportCommentary } from './report-commentary';

describe('reportCommentary function', () => {
  it(
    'writes one line per scope and a summary over body lines',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // One scope, ports, with 1 comment among 4 body lines in source and none
      // in specs.
      const report = reportCommentary([
        {
          scope: 'ports',
          source: { code: 3, comments: 1 },
          specs: { code: 4, comments: 0 },
        },
      ]).join('\n');

      // The scope is named.
      expect(report).toContain('ports');
      // Source is 25% of its four body lines; specs are 0%.
      expect(report).toContain('source 25% of 4 body lines, specs 0% of 4.');
    },
  );

  it('says a number is not a verdict', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // The footer reminds the reader that the measure is not a verdict, even for
    // an empty report.
    expect(reportCommentary([]).join('\n')).toContain(
      'A number is not a verdict.',
    );
  });
});
