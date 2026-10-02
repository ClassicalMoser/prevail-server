import { shuffleCopy } from './shuffle-copy';

const firstAlways = {
  nextFloat: (): number => 0,
};

describe('shuffleCopy function', () => {
  it('leaves a single item in place', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const items = ['only'];
    const shuffled = shuffleCopy(items, firstAlways);

    expect(shuffled).toStrictEqual(['only']);
  });

  it(
    'returns a new array and leaves the input order alone',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const items = ['a', 'b', 'c'];
      const shuffled = shuffleCopy(items, firstAlways);

      expect(shuffled).not.toBe(items);
      expect(items).toStrictEqual(['a', 'b', 'c']);
      expect(shuffled).toHaveLength(3);
    },
  );
});
