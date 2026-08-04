import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { AssetType } from '@ports';

interface UnitCardAssetTarget {
  type: AssetType;
  key: string;
}

const UNIT_CARD_ASSET_TYPES: AssetType[] = ['svg', 'pdf', 'pdf-bleed'];

const unitCardAssetKey = (
  cardId: string,
  version: string,
  assetType: AssetType,
): string => {
  const base = `${cardId}_${version}`;
  switch (assetType) {
    case 'svg': {
      return `cards/unit/svg/${base}.svg`;
    }
    case 'pdf': {
      return `cards/unit/print/${base}.pdf`;
    }
    case 'pdf-bleed': {
      return `cards/unit/print/${base}.bleed.pdf`;
    }
    default: {
      const _exhaustive: never = assetType;
      return _exhaustive;
    }
  }
};

const unitCardAssetTargets = (unitType: UnitType): UnitCardAssetTarget[] =>
  UNIT_CARD_ASSET_TYPES.map((type) => ({
    type,
    key: unitCardAssetKey(unitType.id, unitType.version, type),
  }));

export type { UnitCardAssetTarget };
export { UNIT_CARD_ASSET_TYPES, unitCardAssetKey, unitCardAssetTargets };
