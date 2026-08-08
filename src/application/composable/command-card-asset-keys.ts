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
): string =>
  cardAssetKey({
    kind: 'command',
    cardId,
    version,
    assetType,
  });

const commandCardAssetTargets = (card: CommandCard): CommandCardAssetTarget[] =>
  cardAssetTargets('command', card);

export type { CommandCardAssetTarget };
export {
  COMMAND_CARD_ASSET_TYPES,
  commandCardAssetKey,
  commandCardAssetTargets,
};
