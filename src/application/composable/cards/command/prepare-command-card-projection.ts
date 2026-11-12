import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type {
  AssetStorage,
  CommandCardRendererPort,
  DataErrorSignature,
  UnitCardStorage,
} from '@ports';
import { buildUnitIdToNameMap } from '../build-unit-id-to-name-map';
import type { CardCertificationStatus } from '../certify-card-versions';
import { getCommandCardUnitIds } from '../print/get-command-card-unit-ids';
import type { CommandCardProjectionDeps } from './command-card-project-ops';

/**
 * Gather what printing needs for a batch of command cards about to be certified.
 *
 * A command card can name unit types, and a printed card shows their names, so
 * one name map is built for the whole batch rather than one lookup per card.
 * If any name cannot be resolved the whole run stops, because certifying cards
 * whose assets cannot be drawn would publish them unprintable.
 *
 * @param deps - Unit storage for names, plus the renderer and asset ports the projection uses.
 * @param statuses - The uncertified, schema-valid command card versions.
 * @returns The projection deps for the batch, or the name lookup's failure.
 */
const prepareCommandCardProjection = async (
  deps: {
    unitCardStorage: UnitCardStorage;
    commandCardRenderer: CommandCardRendererPort;
    assetStorage: AssetStorage;
  },
  statuses: CardCertificationStatus<CommandCard>[],
): Promise<DataErrorSignature<CommandCardProjectionDeps>> => {
  // One lookup for every unit any card in the batch names.
  const unitIds = [
    ...new Set(statuses.flatMap(({ card }) => getCommandCardUnitIds(card))),
  ];
  const nameMap = await buildUnitIdToNameMap(deps.unitCardStorage, unitIds);
  if (!nameMap.success) {
    return nameMap;
  }

  const prepared: DataErrorSignature<CommandCardProjectionDeps> = {
    success: true,
    data: {
      assetStorage: deps.assetStorage,
      commandCardRenderer: deps.commandCardRenderer,
      unitIdToNameMap: nameMap.data,
    },
  };
  return prepared;
};

export { prepareCommandCardProjection };
