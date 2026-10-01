import type { RandomSource } from './random-source';
import { pickIndex } from './pick-index';

/**
 * Fisher–Yates on a copy. The input stays in its original order so a legal
 * option list can be sampled again.
 */
const shuffleCopy = <T>(items: readonly T[], random: RandomSource): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = pickIndex(i + 1, random);
    const atI = copy[i];
    const atJ = copy[j];
    copy[i] = atJ;
    copy[j] = atI;
  }
  return copy;
};

export { shuffleCopy };
