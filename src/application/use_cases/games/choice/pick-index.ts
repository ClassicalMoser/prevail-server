import type { RandomSource } from './random-source';

const pickIndex = (length: number, random: RandomSource): number => {
  const index = Math.floor(random.nextFloat() * length);
  return index;
};

export { pickIndex };
