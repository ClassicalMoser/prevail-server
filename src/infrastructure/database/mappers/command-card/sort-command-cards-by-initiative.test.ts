import { tempCommandCards } from '@classicalmoser/prevail-rules/domain';
import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import { sortCommandCardsByInitiative } from './sort-command-cards-by-initiative';

const withInitiative = (card: CommandCard, initiative: number): CommandCard => {
  const next: CommandCard = {
    ...card,
    initiative,
  };
  return next;
};

describe('sortCommandCardsByInitiative function', () => {
  /** Lowest initiative is first. The input array stays in the order the test built. */
  it(
    'sorts by initiative ascending without mutating the input',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const high = withInitiative(tempCommandCards[0], 4);
      const mid = withInitiative(tempCommandCards[1], 2);
      const low = withInitiative(tempCommandCards[2], 1);
      const input = [high, mid, low];

      const sorted = sortCommandCardsByInitiative(input);

      expect(sorted.map((card) => card.initiative)).toStrictEqual([1, 2, 4]);
      expect(input.map((card) => card.initiative)).toStrictEqual([4, 2, 1]);
    },
  );

  it('keeps relative order for equal initiative', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const first = withInitiative(tempCommandCards[0], 2);
    const second = withInitiative(tempCommandCards[1], 2);

    expect(sortCommandCardsByInitiative([second, first])).toStrictEqual([
      second,
      first,
    ]);
  });
});
