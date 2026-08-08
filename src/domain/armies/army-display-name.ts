import type { UnitCount } from '@classicalmoser/prevail-rules/domain';

const UNTITLED_ARMY_NAME = 'Untitled army';

/** Display name persisted with an owned army — not part of rules `Army`. */
const armyDisplayName = (units: readonly UnitCount[]): string => {
  const firstUnitName = units[0]?.unitType.name;
  if (firstUnitName !== undefined) {
    return `${firstUnitName} list`;
  }
  return UNTITLED_ARMY_NAME;
};

export { UNTITLED_ARMY_NAME, armyDisplayName };
