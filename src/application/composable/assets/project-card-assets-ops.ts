import type { AssetStorage, DataErrorSignature } from '@ports';
import type { CardAssetTarget } from './card-asset-keys';

/**
 * Storage, target list, and render callback for one catalog card kind.
 *
 * Shared by project, ensure, and existence checks so command and unit
 * wrappers close over the same shape.
 */
interface ProjectCardAssetsOps<TCard> {
  assetStorage: AssetStorage;
  targets: (card: TCard) => CardAssetTarget[];
  render: (
    card: TCard,
    target: CardAssetTarget,
  ) => Promise<DataErrorSignature<Buffer>>;
}

export type { ProjectCardAssetsOps };
