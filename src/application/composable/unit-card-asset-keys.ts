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
): string =>
  cardAssetKey({
    kind: 'unit',
    cardId,
    version,
    assetType,
  });

const unitCardAssetTargets = (unitType: UnitType): UnitCardAssetTarget[] =>
  cardAssetTargets('unit', unitType);

export type { UnitCardAssetTarget };
export { UNIT_CARD_ASSET_TYPES, unitCardAssetKey, unitCardAssetTargets };
