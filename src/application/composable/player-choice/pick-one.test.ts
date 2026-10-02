import { pickOne } from './pick-one';

const firstAlways = {
  nextFloat: (): number => 0,
};

describe('pickOne function', () => {
  it('returns undefined when the list is empty', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const item = pickOne([], firstAlways);

    expect(item).toBeUndefined();
  });

  it('returns the first item when nextFloat is 0', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const item = pickOne(['a', 'b', 'c'], firstAlways);

    expect(item).toBe('a');
  });
});
