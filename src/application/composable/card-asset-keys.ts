import type { AssetType } from '@ports';

type CardAssetKind = 'command' | 'unit';

interface CardAssetTarget {
  type: AssetType;
  key: string;
}

interface CardAssetKeyInput {
  kind: CardAssetKind;
  cardId: string;
  version: string;
  assetType: AssetType;
}

const CARD_ASSET_TYPES: AssetType[] = ['svg', 'pdf', 'pdf-bleed'];

const cardAssetKey = ({
  kind,
  cardId,
  version,
  assetType,
}: CardAssetKeyInput): string => {
  const base = `${cardId}_${version}`;
  switch (assetType) {
    case 'svg': {
      return `cards/${kind}/svg/${base}.svg`;
    }
    case 'pdf': {
      return `cards/${kind}/print/${base}.pdf`;
    }
    case 'pdf-bleed': {
      return `cards/${kind}/print/${base}.bleed.pdf`;
    }
    default: {
      const _exhaustive: never = assetType;
      return _exhaustive;
    }
  }
};

const cardAssetTargets = (
  kind: CardAssetKind,
  card: { id: string; version: string },
): CardAssetTarget[] =>
  CARD_ASSET_TYPES.map((type) => ({
    type,
    key: cardAssetKey({
      kind,
      cardId: card.id,
      version: card.version,
      assetType: type,
    }),
  }));

export type { CardAssetKind, CardAssetKeyInput, CardAssetTarget };
export { CARD_ASSET_TYPES, cardAssetKey, cardAssetTargets };
