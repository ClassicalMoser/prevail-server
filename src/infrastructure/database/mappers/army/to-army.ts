import type {
  Army,
  CommandCard,
  UnitCount,
} from '@classicalmoser/prevail-rules/domain';

/**
 * Build the domain army from its id, display name, and mapped composition.
 *
 * Rules `Army` carries the name. The army row already stores it, and this
 * mapper copies that string onto the domain value.
 *
 * @param params - Army id, display name, and domain units and command cards.
 * @returns The domain army.
 */
const toArmy = (params: {
  armyId: string;
  armyName: string;
  units: UnitCount[];
  commandCards: CommandCard[];
}): Army => {
  const army: Army = {
    id: params.armyId,
    name: params.armyName,
    units: params.units,
    commandCards: params.commandCards,
  };
  return army;
};

export { toArmy };
