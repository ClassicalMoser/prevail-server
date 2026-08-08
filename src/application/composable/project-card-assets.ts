import type { AssetStorage, DataErrorSignature } from '@ports';
import type { CardAssetTarget } from './card-asset-keys';

const toUploadError = (error: unknown): DataErrorSignature<void> => ({
  success: false,
  message: error instanceof Error ? error.message : 'Failed to upload asset',
  status: 500,
});

const putRenderedAsset = async (
  assetStorage: AssetStorage,
  target: CardAssetTarget,
  renderResult: DataErrorSignature<Buffer>,
): Promise<DataErrorSignature<void>> => {
  if (!renderResult.success) {
    return renderResult;
  }

  try {
    await assetStorage.putImmutable(target.key, renderResult.data, target.type);
    return { success: true, data: undefined };
  } catch (error: unknown) {
    return toUploadError(error);
  }
};

interface ProjectCardAssetsOps<TCard> {
  assetStorage: AssetStorage;
  targets: (card: TCard) => CardAssetTarget[];
  render: (
    card: TCard,
    target: CardAssetTarget,
  ) => Promise<DataErrorSignature<Buffer>>;
}

const projectCardAsset = async <TCard>(
  ops: ProjectCardAssetsOps<TCard>,
  card: TCard,
  target: CardAssetTarget,
): Promise<DataErrorSignature<void>> =>
  putRenderedAsset(ops.assetStorage, target, await ops.render(card, target));

const projectCardVersion = async <TCard>(
  ops: ProjectCardAssetsOps<TCard>,
  card: TCard,
): Promise<DataErrorSignature<void>> => {
  for (const target of ops.targets(card)) {
    const result = await projectCardAsset(ops, card, target);
    if (!result.success) {
      return result;
    }
  }
  return { success: true, data: undefined };
};

const findMissingCardAssetTargets = async <TCard>(
  ops: Pick<ProjectCardAssetsOps<TCard>, 'assetStorage' | 'targets'>,
  card: TCard,
): Promise<CardAssetTarget[]> => {
  const missing: CardAssetTarget[] = [];
  for (const target of ops.targets(card)) {
    if (!(await ops.assetStorage.objectExists(target.key))) {
      missing.push(target);
    }
  }
  return missing;
};

const allCardAssetsExist = async <TCard>(
  ops: Pick<ProjectCardAssetsOps<TCard>, 'assetStorage' | 'targets'>,
  card: TCard,
): Promise<boolean> => {
  for (const target of ops.targets(card)) {
    if (!(await ops.assetStorage.objectExists(target.key))) {
      return false;
    }
  }
  return true;
};

const ensureCardProjection = async <TCard>(
  ops: ProjectCardAssetsOps<TCard>,
  card: TCard,
): Promise<DataErrorSignature<void>> => {
  const missing = await findMissingCardAssetTargets(ops, card);
  for (const target of missing) {
    const result = await projectCardAsset(ops, card, target);
    if (!result.success) {
      return result;
    }
  }
  return { success: true, data: undefined };
};

export type { ProjectCardAssetsOps };
export {
  allCardAssetsExist,
  ensureCardProjection,
  projectCardVersion,
  putRenderedAsset,
};
