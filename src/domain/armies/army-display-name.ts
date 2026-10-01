import type { UnitCount } from '@classicalmoser/prevail-rules/domain';

const UNTITLED_ARMY_NAME = 'Untitled army';

/**
 * Display name persisted with an owned army.
 *
 * Rules `Army` has no name. The first unit type supplies the label so a new
 * list is recognizable before the player renames it. An empty composition
 * stays the untitled constant.
 *
 * @param units - Army composition in write order.
 * @returns `{unit type} list`, or {@link UNTITLED_ARMY_NAME} when there are no units.
 */
const armyDisplayName = (units: readonly UnitCount[]): string => {
  const firstUnitName = units[0]?.unitType.name;
  if (firstUnitName !== undefined) {
    const named = `${firstUnitName} list`;
    return named;
  }
  return UNTITLED_ARMY_NAME;
};

export { UNTITLED_ARMY_NAME, armyDisplayName };
