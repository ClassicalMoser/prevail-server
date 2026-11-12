import type { AssetStorage, DataErrorSignature } from '@ports';
import type { CardAssetTarget } from './card-asset-keys';

/**
 * Storage, target list, and render callback for one catalog card kind.
 *
 * Shared by project, ensure, and existence checks so command and unit
 * wrappers close over the same shape.
 */
interface ProjectCardAssetsOps<TCard> {
  /** Where the drawn files are kept. */
  assetStorage: AssetStorage;
  /** The files a version must have: one per screen and print format. */
  targets: (card: TCard) => CardAssetTarget[];
  /** Draws one target's bytes; the card kind decides which renderer runs. */
  render: (
    card: TCard,
    target: CardAssetTarget,
  ) => Promise<DataErrorSignature<Buffer>>;
}

export type { ProjectCardAssetsOps };
