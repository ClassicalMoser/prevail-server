import { otherSide } from './other-side';

describe('otherSide function', () => {
  it('returns black for white and white for black', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(otherSide('white')).toBe('black');
    expect(otherSide('black')).toBe('white');
  });
});
