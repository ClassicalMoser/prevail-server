import { PLAYER_CHOICE_EVENT_TYPE } from '@classicalmoser/prevail-rules/domain';
import type {
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import type { RandomSource } from './random-source';
import { shuffleCopy } from './shuffle-copy';

const unitInstanceKey = (unit: {
  playerSide: string;
  unitType: { id: string };
  instanceNumber: number;
}): string => {
  const key = `${unit.playerSide}:${unit.unitType.id}:${unit.instanceNumber}`;
  return key;
};

/**
 * Greedy cover: fill each category's slots with unused eligible units.
 *
 * Categories are shuffled, then each category takes a random unused subset
 * up to its support count. A category with no remaining units is skipped.
 */
const pickAssignUnitSupport = (
  options: Extract<
    LegalPlayerChoiceOptions,
    { choiceType: 'assignUnitSupport' }
  >,
  actingPlayer: PlayerSide,
  random: RandomSource,
): PlayerChoiceEvent | undefined => {
  const { assignUnitSupport } = options;
  if (assignUnitSupport.player !== actingPlayer) {
    return undefined;
  }
  const covered = new Set<string>();
  const assignments: {
    unitSupport: (typeof assignUnitSupport.categories)[number]['unitSupport'];
    units: (typeof assignUnitSupport.categories)[number]['eligibleUnits'][number][];
  }[] = [];

  for (const category of shuffleCopy(
    [...assignUnitSupport.categories],
    random,
  )) {
    const shuffledEligible = shuffleCopy(
      category.eligibleUnits.filter(
        (unit) => !covered.has(unitInstanceKey(unit)),
      ),
      random,
    );
    const available = shuffledEligible.slice(0, category.unitSupport.count);
    if (available.length > 0) {
      for (const unit of available) {
        covered.add(unitInstanceKey(unit));
      }
      assignments.push({
        unitSupport: category.unitSupport,
        units: [...available],
      });
    }
  }

  const choice: PlayerChoiceEvent = {
    assignments,
    choiceType: 'assignUnitSupport',
    eventNumber: options.expectedEventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: actingPlayer,
  };
  return choice;
};

export { pickAssignUnitSupport };
