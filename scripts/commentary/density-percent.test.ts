import { densityPercent } from './density-percent';

describe('densityPercent function', () => {
  it(
    'is comments over comments plus code, as a whole percent',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // One comment among four body lines is 25%.
      expect(densityPercent({ code: 3, comments: 1 })).toBe(25);
    },
  );

  it('is zero for a scope with no body at all', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // No body lines at all must give 0, not a division by zero.
    expect(densityPercent({ code: 0, comments: 0 })).toBe(0);
  });
});
