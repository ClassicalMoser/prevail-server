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
