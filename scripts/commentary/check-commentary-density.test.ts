import { checkCommentaryDensity } from './check-commentary-density';

describe('checkCommentaryDensity function', () => {
  it('reports and never fails', { timeout: 20_000 }, async () => {
    expect.hasAssertions();

    // This runs the real check over the repository.
    const result = await checkCommentaryDensity();

    // The check is a report and never fails the build.
    expect(result.failure).toBeNull();
    // The report names the measure it prints.
    expect(result.output).toContain('In-body commentary');
  });
});
