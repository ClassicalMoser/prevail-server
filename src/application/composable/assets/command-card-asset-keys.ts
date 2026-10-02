import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { AssetType } from '@ports';
import type { CardAssetTarget } from './card-asset-keys';
import {
  CARD_ASSET_TYPES,
  cardAssetKey,
  cardAssetTargets,
} from './card-asset-keys';

type CommandCardAssetTarget = CardAssetTarget;

/** Asset types projected for every command-card version. */
const COMMAND_CARD_ASSET_TYPES: AssetType[] = CARD_ASSET_TYPES;

/**
 * Object key for one command-card asset under the command kind prefix.
 *
 * @param cardId - Command card id.
 * @param version - Dotted version string on the card.
 * @param assetType - Which render format to key.
 * @returns The immutable R2 key for that asset.
 */
const commandCardAssetKey = (
  cardId: string,
  version: string,
  assetType: AssetType,
): string => {
  const key = cardAssetKey({
    kind: 'command',
    cardId,
    version,
    assetType,
  });
  return key;
};

/**
 * Every asset target for one command-card version.
 *
 * @param card - Domain command card whose id and version form the keys.
 * @returns Svg, pdf, and bleed targets for that version.
 */
const commandCardAssetTargets = (
  card: CommandCard,
): CommandCardAssetTarget[] => {
  const targets = cardAssetTargets('command', card);
  return targets;
};

export type { CommandCardAssetTarget };
export {
  COMMAND_CARD_ASSET_TYPES,
  commandCardAssetKey,
  commandCardAssetTargets,
};
