/** Injectable [0, 1) source so bots stay deterministic in tests. */
interface RandomSource {
  nextFloat: () => number;
}

const defaultRandom: RandomSource = {
  nextFloat: () => Math.random(),
};

export type { RandomSource };
export { defaultRandom };
