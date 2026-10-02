import type { AssetStorage, DataErrorSignature } from '@ports';
import type { CardAssetTarget } from './card-asset-keys';

/**
 * Turn a failed asset upload into a storage error envelope.
 *
 * The message is the thrown error's message when there is one, so a renderer
 * or S3 failure stays visible to the use case that asked for the projection.
 */
const toUploadError = (error: unknown): DataErrorSignature<void> => ({
  success: false,
  message: error instanceof Error ? error.message : 'Failed to upload asset',
  status: 500,
});

/**
 * Render one card asset and store it under the target key.
 *
 * A render failure is returned as-is. A thrown upload becomes an error
 * envelope so the caller can stop the rest of the projection.
 *
 * @param assetStorage - Immutable object store for card assets.
 * @param target - Key and type for the object being written.
 * @param renderResult - Bytes from the renderer, or a prior render failure.
 * @returns Success when the object is stored, or an error envelope.
 */
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

/**
 * Render one target for a card and upload it when the render succeeds.
 *
 * @param ops - Storage, target list, and render callback for this card kind.
 * @param card - Card version being projected.
 * @param target - Single asset key and type to write.
 * @returns Success when the object is stored, or the first render/upload error.
 */
const projectCardAsset = async <TCard>(
  ops: ProjectCardAssetsOps<TCard>,
  card: TCard,
  target: CardAssetTarget,
): Promise<DataErrorSignature<void>> =>
  putRenderedAsset(ops.assetStorage, target, await ops.render(card, target));

/**
 * Render every asset target for one card version.
 *
 * Targets are written in order. The first failure stops the rest so a half
 * written version is not reported as complete.
 *
 * @param ops - Storage, target list, and render callback for this card kind.
 * @param card - Card version being projected.
 * @returns Success when every target is stored, or the first failure.
 */
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

/**
 * Collect asset targets whose keys are not yet in storage.
 *
 * @param ops - Storage and target list for this card kind.
 * @param card - Card version whose keys are checked.
 * @returns Targets that still need a render.
 */
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

/**
 * Whether every projected asset for this card version already exists.
 *
 * Used before certification so a card is not stamped until its print and
 * preview files are present.
 *
 * @param ops - Storage and target list for this card kind.
 * @param card - Card version to check.
 * @returns True when every target key exists in storage.
 */
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

/**
 * Render only the missing assets for a card version.
 *
 * Certification heals holes this way so an interrupted prior projection can
 * finish without rewriting keys that already exist.
 *
 * @param ops - Storage, target list, and render callback for this card kind.
 * @param card - Card version to heal.
 * @returns Success when every missing target is stored, or the first failure.
 */
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
