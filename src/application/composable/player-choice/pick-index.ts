import type { RandomSource } from './random-source';

/**
 * Draw a uniform index in `[0, length)`.
 *
 * Callers must pass a positive length; an empty collection is handled upstream
 * by `pickOne` before this runs.
 *
 * @param length - Exclusive upper bound for the index.
 * @param random - Source of the unit float in `[0, 1)`.
 * @returns An integer index into a collection of that length.
 */
const pickIndex = (length: number, random: RandomSource): number => {
  const index = Math.floor(random.nextFloat() * length);
  return index;
};

export { pickIndex };
