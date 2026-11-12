import type { AssetType } from '@ports';

/** Which catalog a card belongs to; it is the first folder in the asset key. */
type CardAssetKind = 'command' | 'unit';

/** One file a card version must have in storage: its key and which format it is. */
interface CardAssetTarget {
  type: AssetType;
  key: string;
}

/** Everything that identifies one stored card file: kind, card, version and format. */
interface CardAssetKeyInput {
  kind: CardAssetKind;
  cardId: string;
  version: string;
  assetType: AssetType;
}

/** Asset types projected for every catalog card version. */
const CARD_ASSET_TYPES: AssetType[] = ['svg', 'pdf', 'pdf-bleed'];

/**
 * Build the immutable R2 object key for one card asset.
 *
 * SVG lives under `svg/`. Print PDFs (trim and bleed) share the `print/`
 * folder so a version's print pair stays adjacent in the bucket listing.
 *
 * @param input - Kind, card id, version, and which asset type to key.
 * @returns The object key under the card asset prefix.
 */
const cardAssetKey = ({
  kind,
  cardId,
  version,
  assetType,
}: CardAssetKeyInput): string => {
  // Id plus version make the key unique per published version, which is what
  // lets assets be immutable: a new version is a new key, never an overwrite.
  const base = `${cardId}_${version}`;
  switch (assetType) {
    case 'svg': {
      const key = `cards/${kind}/svg/${base}.svg`;
      return key;
    }
    case 'pdf': {
      const key = `cards/${kind}/print/${base}.pdf`;
      return key;
    }
    case 'pdf-bleed': {
      const key = `cards/${kind}/print/${base}.bleed.pdf`;
      return key;
    }
    default: {
      const _exhaustive: never = assetType;
      return _exhaustive;
    }
  }
};

/**
 * List every asset target for one card version.
 *
 * Projection and certification walk this list in order. A missing key means
 * that version is not fully projected yet.
 *
 * @param kind - Command or unit prefix in the object key.
 * @param card - Card identity and version used in the key.
 * @returns One target per {@link CARD_ASSET_TYPES} entry.
 */
const cardAssetTargets = (
  kind: CardAssetKind,
  card: { id: string; version: string },
): CardAssetTarget[] => {
  const targets = CARD_ASSET_TYPES.map((type) => {
    const key = cardAssetKey({
      kind,
      cardId: card.id,
      version: card.version,
      assetType: type,
    });
    const target: CardAssetTarget = { type, key };
    return target;
  });
  return targets;
};

export type { CardAssetKind, CardAssetKeyInput, CardAssetTarget };
export { CARD_ASSET_TYPES, cardAssetKey, cardAssetTargets };
