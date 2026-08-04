import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type {
  AssetStorage,
  DataErrorSignature,
  UnitCardRendererPort,
} from '@ports';
import type { UnitCardAssetTarget } from './unit-card-asset-keys';
import { unitCardAssetTargets } from './unit-card-asset-keys';
import { renderDetailsForAssetType } from './render-details-for-asset-type';

interface UnitCardProjectionDeps {
  assetStorage: AssetStorage;
  unitCardRenderer: UnitCardRendererPort;
}

const toUploadError = (error: unknown): DataErrorSignature<void> => ({
  success: false,
  message: error instanceof Error ? error.message : 'Failed to upload asset',
  status: 500,
});

const projectUnitCardAsset = async (
  deps: UnitCardProjectionDeps,
  unitType: UnitType,
  target: UnitCardAssetTarget,
): Promise<DataErrorSignature<void>> => {
  const renderResult = await deps.unitCardRenderer.renderUnitCard(
    unitType,
    renderDetailsForAssetType(target.type),
  );
  if (!renderResult.success) {
    return renderResult;
  }

  try {
    await deps.assetStorage.putImmutable(
      target.key,
      renderResult.data,
      target.type,
    );
    return { success: true, data: undefined };
  } catch (error: unknown) {
    return toUploadError(error);
  }
};

const projectUnitCardVersion = async (
  deps: UnitCardProjectionDeps,
  unitType: UnitType,
): Promise<DataErrorSignature<void>> => {
  for (const target of unitCardAssetTargets(unitType)) {
    const result = await projectUnitCardAsset(deps, unitType, target);
    if (!result.success) {
      return result;
    }
  }

  return { success: true, data: undefined };
};

const findMissingUnitCardAssetTargets = async (
  assetStorage: AssetStorage,
  unitType: UnitType,
): Promise<UnitCardAssetTarget[]> => {
  const missing: UnitCardAssetTarget[] = [];

  for (const target of unitCardAssetTargets(unitType)) {
    if (!(await assetStorage.objectExists(target.key))) {
      missing.push(target);
    }
  }

  return missing;
};

const allUnitCardAssetsExist = async (
  assetStorage: AssetStorage,
  unitType: UnitType,
): Promise<boolean> => {
  for (const target of unitCardAssetTargets(unitType)) {
    if (!(await assetStorage.objectExists(target.key))) {
      return false;
    }
  }

  return true;
};

const ensureUnitCardProjection = async (
  deps: UnitCardProjectionDeps,
  unitType: UnitType,
): Promise<DataErrorSignature<void>> => {
  const missing = await findMissingUnitCardAssetTargets(
    deps.assetStorage,
    unitType,
  );

  for (const target of missing) {
    const result = await projectUnitCardAsset(deps, unitType, target);
    if (!result.success) {
      return result;
    }
  }

  return { success: true, data: undefined };
};

export type { UnitCardProjectionDeps };
export {
  allUnitCardAssetsExist,
  ensureUnitCardProjection,
  projectUnitCardVersion,
};
