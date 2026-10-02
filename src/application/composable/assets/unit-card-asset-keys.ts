import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { AssetType } from '@ports';
import type { CardAssetTarget } from './card-asset-keys';
import {
  CARD_ASSET_TYPES,
  cardAssetKey,
  cardAssetTargets,
} from './card-asset-keys';

type UnitCardAssetTarget = CardAssetTarget;

/** Asset types projected for every unit-card version. */
const UNIT_CARD_ASSET_TYPES: AssetType[] = CARD_ASSET_TYPES;

/**
 * Object key for one unit-card asset under the unit kind prefix.
 *
 * @param cardId - Unit type id.
 * @param version - Dotted version string on the unit type.
 * @param assetType - Which render format to key.
 * @returns The immutable R2 key for that asset.
 */
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

/**
 * Every asset target for one unit-card version.
 *
 * @param unitType - Domain unit type whose id and version form the keys.
 * @returns Svg, pdf, and bleed targets for that version.
 */
const unitCardAssetTargets = (unitType: UnitType): UnitCardAssetTarget[] => {
  const targets = cardAssetTargets('unit', unitType);
  return targets;
};

export type { UnitCardAssetTarget };
export { UNIT_CARD_ASSET_TYPES, unitCardAssetKey, unitCardAssetTargets };
