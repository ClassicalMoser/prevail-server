import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type {
  AssetStorage,
  DataErrorSignature,
  UnitCardRendererPort,
} from '@ports';
import type { CardAssetTarget } from '../assets/card-asset-keys';
import type { ProjectCardAssetsOps } from '../assets/project-card-assets-ops';
import { allCardAssetsExist } from '../assets/all-card-assets-exist';
import { ensureCardProjection } from '../assets/ensure-card-projection';
import { projectCardVersion } from '../assets/project-card-version';
import { renderDetailsForAssetType } from '../assets/render-details-for-asset-type';
import { unitCardAssetTargets } from '../assets/unit-card-asset-keys';

interface UnitCardProjectionDeps {
  assetStorage: AssetStorage;
  unitCardRenderer: UnitCardRendererPort;
}

/**
 * Build the projection ops that render a unit card for each asset type.
 *
 * @param deps - Storage and unit-card renderer.
 * @returns Ops consumed by the shared card projection helpers.
 */
const unitCardProjectOps = (
  deps: UnitCardProjectionDeps,
): ProjectCardAssetsOps<UnitType> => ({
  assetStorage: deps.assetStorage,
  targets: unitCardAssetTargets,
  render: async (
    unitType: UnitType,
    target: CardAssetTarget,
  ): Promise<DataErrorSignature<Buffer>> =>
    deps.unitCardRenderer.renderUnitCard(
      unitType,
      renderDetailsForAssetType(target.type),
    ),
});

/**
 * Render and store every asset for one unit-card version.
 *
 * @param deps - Storage and unit-card renderer.
 * @param unitType - Unit type version to project.
 * @returns Success when every target is stored, or the first failure.
 */
const projectUnitCardVersion = async (
  deps: UnitCardProjectionDeps,
  unitType: UnitType,
): Promise<DataErrorSignature<void>> =>
  projectCardVersion(unitCardProjectOps(deps), unitType);

/**
 * Whether every unit-card asset for this version already exists.
 *
 * @param assetStorage - Immutable object store.
 * @param unitType - Unit type version to check.
 * @returns True when svg, pdf, and bleed keys are present.
 */
const allUnitCardAssetsExist = async (
  assetStorage: AssetStorage,
  unitType: UnitType,
): Promise<boolean> =>
  allCardAssetsExist({ assetStorage, targets: unitCardAssetTargets }, unitType);

/**
 * Render only the missing assets for one unit-card version.
 *
 * @param deps - Storage and unit-card renderer.
 * @param unitType - Unit type version to heal.
 * @returns Success when every missing target is stored, or the first failure.
 */
const ensureUnitCardProjection = async (
  deps: UnitCardProjectionDeps,
  unitType: UnitType,
): Promise<DataErrorSignature<void>> =>
  ensureCardProjection(unitCardProjectOps(deps), unitType);

export type { UnitCardProjectionDeps };
export {
  allUnitCardAssetsExist,
  ensureUnitCardProjection,
  projectUnitCardVersion,
};
