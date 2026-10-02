import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { AssetType } from '@ports';
import type { CardAssetTarget } from './card-asset-keys';
import {
  CARD_ASSET_TYPES,
  cardAssetKey,
  cardAssetTargets,
} from './card-asset-keys';

type UnitCardAssetTarget = CardAssetTarget;

const UNIT_CARD_ASSET_TYPES: AssetType[] = CARD_ASSET_TYPES;

const unitCardAssetKey = (
  cardId: string,
  version: string,
  assetType: AssetType,
): string => {
  const key = cardAssetKey({
    kind: 'unit',
    cardId,
    version,
    assetType,
  });
  return key;
};

const unitCardAssetTargets = (unitType: UnitType): UnitCardAssetTarget[] => {
  const targets = cardAssetTargets('unit', unitType);
  return targets;
};

export type { UnitCardAssetTarget };
export { UNIT_CARD_ASSET_TYPES, unitCardAssetKey, unitCardAssetTargets };
