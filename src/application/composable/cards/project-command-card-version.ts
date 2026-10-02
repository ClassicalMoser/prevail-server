import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type {
  AssetStorage,
  CommandCardRendererPort,
  DataErrorSignature,
} from '@ports';
import type { CardAssetTarget } from '../assets/card-asset-keys';
import { commandCardAssetTargets } from '../assets/command-card-asset-keys';
import type { ProjectCardAssetsOps } from '../assets/project-card-assets-ops';
import { allCardAssetsExist } from '../assets/all-card-assets-exist';
import { ensureCardProjection } from '../assets/ensure-card-projection';
import { projectCardVersion } from '../assets/project-card-version';
import { renderDetailsForAssetType } from '../assets/render-details-for-asset-type';
import type { UnitIdToNameMap } from './replace-command-card-ids-with-names';
import { replaceCommandCardUnitIdsWithNames } from './replace-command-card-ids-with-names';

interface CommandCardProjectionDeps {
  assetStorage: AssetStorage;
  commandCardRenderer: CommandCardRendererPort;
  unitIdToNameMap: UnitIdToNameMap;
}

/**
 * Build the projection ops that render a command card with unit names inlined.
 *
 * @param deps - Storage, renderer, and the unit id→name map for print.
 * @returns Ops consumed by the shared card projection helpers.
 */
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

/**
 * Render and store every asset for one command-card version.
 *
 * @param deps - Storage, renderer, and unit name map.
 * @param card - Command card version to project.
 * @returns Success when every target is stored, or the first failure.
 */
const projectCommandCardVersion = async (
  deps: CommandCardProjectionDeps,
  card: CommandCard,
): Promise<DataErrorSignature<void>> =>
  projectCardVersion(commandCardProjectOps(deps), card);

/**
 * Whether every command-card asset for this version already exists.
 *
 * @param assetStorage - Immutable object store.
 * @param card - Command card version to check.
 * @returns True when svg, pdf, and bleed keys are present.
 */
const allCommandCardAssetsExist = async (
  assetStorage: AssetStorage,
  card: CommandCard,
): Promise<boolean> =>
  allCardAssetsExist({ assetStorage, targets: commandCardAssetTargets }, card);

/**
 * Render only the missing assets for one command-card version.
 *
 * @param deps - Storage, renderer, and unit name map.
 * @param card - Command card version to heal.
 * @returns Success when every missing target is stored, or the first failure.
 */
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
