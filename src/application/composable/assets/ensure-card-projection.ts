import type { DataErrorSignature } from '@ports';
import type { CardAssetTarget } from './card-asset-keys';
import type { ProjectCardAssetsOps } from './project-card-assets-ops';
import { putRenderedAsset } from './put-rendered-asset';

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
    const renderResult = await ops.render(card, target);
    const result = await putRenderedAsset(
      ops.assetStorage,
      target,
      renderResult,
    );
    if (!result.success) {
      return result;
    }
  }
  return { success: true, data: undefined };
};

export { ensureCardProjection };
