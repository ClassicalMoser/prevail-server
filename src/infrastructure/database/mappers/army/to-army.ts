import type {
  Army,
  CommandCard,
  UnitCount,
} from '@classicalmoser/prevail-rules/domain';

/**
 * Build the domain army from an id and its already-mapped composition.
 *
 * Display name is a server concern and is not part of rules `Army`.
 *
 * @param params - Army id plus units and command cards in domain shape.
 * @returns The domain army.
 */
const toArmy = (params: {
  armyId: string;
  units: UnitCount[];
  commandCards: CommandCard[];
}): Army => {
  const army: Army = {
    id: params.armyId,
    units: params.units,
    commandCards: params.commandCards,
  };
  return army;
};

export { toArmy };
