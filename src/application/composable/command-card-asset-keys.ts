import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { AssetType } from '@ports';
import type { CardAssetTarget } from './card-asset-keys';
import {
  CARD_ASSET_TYPES,
  cardAssetKey,
  cardAssetTargets,
} from './card-asset-keys';

type CommandCardAssetTarget = CardAssetTarget;

const COMMAND_CARD_ASSET_TYPES: AssetType[] = CARD_ASSET_TYPES;

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
