import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { AssetStorage } from '@ports';
import { allCardAssetsExist } from '@application/composable/assets/all-card-assets-exist';
import { unitCardAssetTargets } from '@application/composable/assets/unit-card-asset-keys';

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
): Promise<boolean> => {
  const exists = await allCardAssetsExist(
    { assetStorage, targets: unitCardAssetTargets },
    unitType,
  );
  return exists;
};

export { allUnitCardAssetsExist };
