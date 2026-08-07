import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { AssetType } from '@ports';

interface CommandCardAssetTarget {
  type: AssetType;
  key: string;
}

const COMMAND_CARD_ASSET_TYPES: AssetType[] = ['svg', 'pdf', 'pdf-bleed'];

const commandCardAssetKey = (
  cardId: string,
  version: string,
  assetType: AssetType,
): string => {
  const base = `${cardId}_${version}`;
  switch (assetType) {
    case 'svg': {
      return `cards/command/svg/${base}.svg`;
    }
    case 'pdf': {
      return `cards/command/print/${base}.pdf`;
    }
    case 'pdf-bleed': {
      return `cards/command/print/${base}.bleed.pdf`;
    }
    default: {
      const _exhaustive: never = assetType;
      return _exhaustive;
    }
  }
};

const commandCardAssetTargets = (card: CommandCard): CommandCardAssetTarget[] =>
  COMMAND_CARD_ASSET_TYPES.map((type) => ({
    type,
    key: commandCardAssetKey(card.id, card.version, type),
  }));

export type { CommandCardAssetTarget };
export {
  COMMAND_CARD_ASSET_TYPES,
  commandCardAssetKey,
  commandCardAssetTargets,
};
