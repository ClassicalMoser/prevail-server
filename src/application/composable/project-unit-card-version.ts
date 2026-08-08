import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type {
  AssetStorage,
  DataErrorSignature,
  UnitCardRendererPort,
} from '@ports';
import type { CardAssetTarget } from './card-asset-keys';
import type { ProjectCardAssetsOps } from './project-card-assets';
import {
  allCardAssetsExist,
  ensureCardProjection,
  projectCardVersion,
} from './project-card-assets';
import { renderDetailsForAssetType } from './render-details-for-asset-type';
import { unitCardAssetTargets } from './unit-card-asset-keys';

interface UnitCardProjectionDeps {
  assetStorage: AssetStorage;
  unitCardRenderer: UnitCardRendererPort;
}

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

const projectUnitCardVersion = async (
  deps: UnitCardProjectionDeps,
  unitType: UnitType,
): Promise<DataErrorSignature<void>> =>
  projectCardVersion(unitCardProjectOps(deps), unitType);

const allUnitCardAssetsExist = async (
  assetStorage: AssetStorage,
  unitType: UnitType,
): Promise<boolean> =>
  allCardAssetsExist({ assetStorage, targets: unitCardAssetTargets }, unitType);

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
