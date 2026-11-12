import type { BodyDensity } from './body-density';

/**
 * The share of a body that is commentary, as a whole percent.
 *
 * Comments over code, not over the whole file: a numerator restricted to
 * bodies needs a denominator restricted to them too, or every module reads
 * low in proportion to how many imports and signatures it has.
 *
 * @param density - Lines counted inside bodies
 * @returns The percentage, and zero for a scope with no body at all
 */
export function densityPercent(density: BodyDensity): number {
  const total = density.comments + density.code;

  // A scope with no bodies has no density to report rather than a zero one,
  // but zero is what compares safely against a floor.
  if (total === 0) {
    return 0;
  }

  const percent = Math.round((density.comments * 100) / total);
  return percent;
}
