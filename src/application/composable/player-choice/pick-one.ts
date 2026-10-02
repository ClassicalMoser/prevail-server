import type { RandomSource } from './random-source';
import { pickIndex } from './pick-index';

/**
 * Draw one element from a readonly list, or undefined when the list is empty.
 *
 * @param items - Candidates to choose among.
 * @param random - Source of the uniform draw.
 * @returns One item, or undefined for an empty list.
 */
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
