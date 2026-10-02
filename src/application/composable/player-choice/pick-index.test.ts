import { pickIndex } from './pick-index';

const firstAlways = {
  nextFloat: (): number => 0,
};

const lastSlot = {
  nextFloat: (): number => 0.999,
};

describe('pickIndex function', () => {
  it('returns 0 when nextFloat is 0', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const index = pickIndex(4, firstAlways);

    expect(index).toBe(0);
  });

  it(
    'returns the last index when nextFloat is almost 1',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const index = pickIndex(4, lastSlot);

      expect(index).toBe(3);
    },
  );
});
