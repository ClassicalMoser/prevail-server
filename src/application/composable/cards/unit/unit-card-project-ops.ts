import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type {
  AssetStorage,
  DataErrorSignature,
  UnitCardRendererPort,
} from '@ports';
import type { CardAssetTarget } from '@application/composable/assets/card-asset-keys';
import type { ProjectCardAssetsOps } from '@application/composable/assets/project-card-assets-ops';
import { renderDetailsForAssetType } from '@application/composable/assets/render-details-for-asset-type';
import { unitCardAssetTargets } from '@application/composable/assets/unit-card-asset-keys';

interface UnitCardProjectionDeps {
  assetStorage: AssetStorage;
  unitCardRenderer: UnitCardRendererPort;
}

/**
 * Build the projection ops that render a unit card for each asset type.
 *
 * @param deps - Storage and unit-card renderer.
 * @returns Ops consumed by project and ensure helpers.
 */
const unitCardProjectOps = (
  deps: UnitCardProjectionDeps,
): ProjectCardAssetsOps<UnitType> => ({
  assetStorage: deps.assetStorage,
  targets: unitCardAssetTargets,
  render: async (
    unitType: UnitType,
    target: CardAssetTarget,
  ): Promise<DataErrorSignature<Buffer>> => {
    const rendered = await deps.unitCardRenderer.renderUnitCard(
      unitType,
      renderDetailsForAssetType(target.type),
    );
    return rendered;
  },
});

export type { UnitCardProjectionDeps };
export { unitCardProjectOps };
