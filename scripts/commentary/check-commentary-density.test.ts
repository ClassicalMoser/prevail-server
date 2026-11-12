import { checkCommentaryDensity } from './check-commentary-density';

describe('checkCommentaryDensity function', () => {
  it('reports and never fails', { timeout: 20_000 }, async () => {
    expect.hasAssertions();

    const result = await checkCommentaryDensity();

    expect(result.failure).toBeNull();
    expect(result.output).toContain('In-body commentary');
  });
});
