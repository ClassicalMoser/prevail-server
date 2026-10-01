import type { RandomSource } from './random-source';
import { pickIndex } from './pick-index';

const pickOne = <T>(
  items: readonly T[],
  random: RandomSource,
): T | undefined => {
  if (items.length === 0) {
    return undefined;
  }
  const item = items[pickIndex(items.length, random)];
  return item;
};

export { pickOne };
