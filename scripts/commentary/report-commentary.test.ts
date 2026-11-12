import { reportCommentary } from './report-commentary';

describe('reportCommentary function', () => {
  it(
    'writes one line per scope and a summary over body lines',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const report = reportCommentary([
        {
          scope: 'ports',
          source: { code: 3, comments: 1 },
          specs: { code: 4, comments: 0 },
        },
      ]).join('\n');

      expect(report).toContain('ports');
      expect(report).toContain('source 25% of 4 body lines, specs 0% of 4.');
    },
  );

  it('says a number is not a verdict', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(reportCommentary([]).join('\n')).toContain(
      'A number is not a verdict.',
    );
  });
});
