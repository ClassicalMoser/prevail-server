import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type {
  AssetStorage,
  CommandCardRendererPort,
  DataErrorSignature,
} from '@ports';
import type { CardAssetTarget } from '@application/composable/assets/card-asset-keys';
import { commandCardAssetTargets } from '@application/composable/assets/command-card-asset-keys';
import type { ProjectCardAssetsOps } from '@application/composable/assets/project-card-assets-ops';
import { renderDetailsForAssetType } from '@application/composable/assets/render-details-for-asset-type';
import type { UnitIdToNameMap } from '../print/unit-id-to-name-map';
import { replaceCommandCardUnitIdsWithNames } from '../print/replace-command-card-unit-ids-with-names';

/** What drawing a command card needs: asset store, renderer, and unit names for print. */
interface CommandCardProjectionDeps {
  assetStorage: AssetStorage;
  commandCardRenderer: CommandCardRendererPort;
  unitIdToNameMap: UnitIdToNameMap;
}

/**
 * Build the projection ops that render a command card with unit names inlined.
 *
 * @param deps - Storage, renderer, and the unit id→name map for print.
 * @returns Ops consumed by project and ensure helpers.
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
    // The stored card names units by id; the printed card must show their names.
    const printCard = replaceCommandCardUnitIdsWithNames(
      card,
      deps.unitIdToNameMap,
    );
    // The asset type picks bleed and format, so one card yields screen and print files.
    const rendered = await deps.commandCardRenderer.renderCommandCard(
      printCard,
      renderDetailsForAssetType(target.type),
    );
    return rendered;
  },
});

export type { CommandCardProjectionDeps };
export { commandCardProjectOps };
