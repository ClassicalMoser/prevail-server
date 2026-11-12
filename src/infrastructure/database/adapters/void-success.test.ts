import { voidSuccess } from './void-success';

describe('voidSuccess function', () => {
  it('builds a successful void envelope', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // Writes with nothing to return answer success with no data.
    const result = voidSuccess();

    expect(result).toStrictEqual({ data: undefined, success: true });
  });
});
