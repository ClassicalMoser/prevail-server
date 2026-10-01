/**
 * Order command cards by initiative without mutating the input.
 *
 * Multi-card reads should present the same sequence the round uses, lowest
 * initiative first. Equal initiatives keep their incoming order.
 *
 * @param cards - Cards that carry an initiative, in fetch order.
 * @returns A new array sorted ascending by initiative.
 */
const sortCommandCardsByInitiative = <T extends { initiative: number }>(
  cards: readonly T[],
): T[] => {
  const sorted = cards.toSorted(
    (left, right) => left.initiative - right.initiative,
  );
  return sorted;
};

export { sortCommandCardsByInitiative };
