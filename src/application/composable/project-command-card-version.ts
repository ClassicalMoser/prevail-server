import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type {
  AssetStorage,
  CommandCardRendererPort,
  DataErrorSignature,
} from '@ports';
import type { CommandCardAssetTarget } from './command-card-asset-keys';
import { commandCardAssetTargets } from './command-card-asset-keys';
import { renderDetailsForAssetType } from './render-details-for-asset-type';
import type { UnitIdToNameMap } from './replace-command-card-ids-with-names';
import { replaceCommandCardUnitIdsWithNames } from './replace-command-card-ids-with-names';

interface CommandCardProjectionDeps {
  assetStorage: AssetStorage;
  commandCardRenderer: CommandCardRendererPort;
  unitIdToNameMap: UnitIdToNameMap;
}

const toUploadError = (error: unknown): DataErrorSignature<void> => ({
  success: false,
  message: error instanceof Error ? error.message : 'Failed to upload asset',
  status: 500,
});

const projectCommandCardAsset = async (
  deps: CommandCardProjectionDeps,
  card: CommandCard,
  target: CommandCardAssetTarget,
): Promise<DataErrorSignature<void>> => {
  const printCard = replaceCommandCardUnitIdsWithNames(
    card,
    deps.unitIdToNameMap,
  );
  const renderResult = await deps.commandCardRenderer.renderCommandCard(
    printCard,
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

const projectCommandCardVersion = async (
  deps: CommandCardProjectionDeps,
  card: CommandCard,
): Promise<DataErrorSignature<void>> => {
  for (const target of commandCardAssetTargets(card)) {
    const result = await projectCommandCardAsset(deps, card, target);
    if (!result.success) {
      return result;
    }
  }

  return { success: true, data: undefined };
};

const findMissingCommandCardAssetTargets = async (
  assetStorage: AssetStorage,
  card: CommandCard,
): Promise<CommandCardAssetTarget[]> => {
  const missing: CommandCardAssetTarget[] = [];

  for (const target of commandCardAssetTargets(card)) {
    if (!(await assetStorage.objectExists(target.key))) {
      missing.push(target);
    }
  }

  return missing;
};

const allCommandCardAssetsExist = async (
  assetStorage: AssetStorage,
  card: CommandCard,
): Promise<boolean> => {
  for (const target of commandCardAssetTargets(card)) {
    if (!(await assetStorage.objectExists(target.key))) {
      return false;
    }
  }

  return true;
};

const ensureCommandCardProjection = async (
  deps: CommandCardProjectionDeps,
  card: CommandCard,
): Promise<DataErrorSignature<void>> => {
  const missing = await findMissingCommandCardAssetTargets(
    deps.assetStorage,
    card,
  );

  for (const target of missing) {
    const result = await projectCommandCardAsset(deps, card, target);
    if (!result.success) {
      return result;
    }
  }

  return { success: true, data: undefined };
};

export type { CommandCardProjectionDeps };
export {
  allCommandCardAssetsExist,
  ensureCommandCardProjection,
  projectCommandCardVersion,
};
