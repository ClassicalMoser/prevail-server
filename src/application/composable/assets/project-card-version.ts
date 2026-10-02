import type { DataErrorSignature } from '@ports';
import type { CardAssetTarget } from './card-asset-keys';
import type { ProjectCardAssetsOps } from './project-card-assets-ops';
import { putRenderedAsset } from './put-rendered-asset';

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
): Promise<DataErrorSignature<void>> => {
  const renderResult = await ops.render(card, target);
  const stored = await putRenderedAsset(ops.assetStorage, target, renderResult);
  return stored;
};

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

export { projectCardVersion };
