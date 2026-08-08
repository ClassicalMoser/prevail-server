import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type {
  AssetStorage,
  CommandCardRendererPort,
  DataErrorSignature,
} from '@ports';
import type { CardAssetTarget } from './card-asset-keys';
import { commandCardAssetTargets } from './command-card-asset-keys';
import type { ProjectCardAssetsOps } from './project-card-assets';
import {
  allCardAssetsExist,
  ensureCardProjection,
  projectCardVersion,
} from './project-card-assets';
import { renderDetailsForAssetType } from './render-details-for-asset-type';
import type { UnitIdToNameMap } from './replace-command-card-ids-with-names';
import { replaceCommandCardUnitIdsWithNames } from './replace-command-card-ids-with-names';

interface CommandCardProjectionDeps {
  assetStorage: AssetStorage;
  commandCardRenderer: CommandCardRendererPort;
  unitIdToNameMap: UnitIdToNameMap;
}

const commandCardProjectOps = (
  deps: CommandCardProjectionDeps,
): ProjectCardAssetsOps<CommandCard> => ({
  assetStorage: deps.assetStorage,
  targets: commandCardAssetTargets,
  render: async (
    card: CommandCard,
    target: CardAssetTarget,
  ): Promise<DataErrorSignature<Buffer>> => {
    const printCard = replaceCommandCardUnitIdsWithNames(
      card,
      deps.unitIdToNameMap,
    );
    return deps.commandCardRenderer.renderCommandCard(
      printCard,
      renderDetailsForAssetType(target.type),
    );
  },
});

const projectCommandCardVersion = async (
  deps: CommandCardProjectionDeps,
  card: CommandCard,
): Promise<DataErrorSignature<void>> =>
  projectCardVersion(commandCardProjectOps(deps), card);

const allCommandCardAssetsExist = async (
  assetStorage: AssetStorage,
  card: CommandCard,
): Promise<boolean> =>
  allCardAssetsExist({ assetStorage, targets: commandCardAssetTargets }, card);

const ensureCommandCardProjection = async (
  deps: CommandCardProjectionDeps,
  card: CommandCard,
): Promise<DataErrorSignature<void>> =>
  ensureCardProjection(commandCardProjectOps(deps), card);

export type { CommandCardProjectionDeps };
export {
  allCommandCardAssetsExist,
  ensureCommandCardProjection,
  projectCommandCardVersion,
};
