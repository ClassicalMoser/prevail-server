import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { AssetStorage } from '@ports';
import { allCardAssetsExist } from '@application/composable/assets/all-card-assets-exist';
import { commandCardAssetTargets } from '@application/composable/assets/command-card-asset-keys';

/**
 * Whether every command-card asset for this version already exists.
 *
 * @param assetStorage - Immutable object store.
 * @param card - Command card version to check.
 * @returns True when svg, pdf, and bleed keys are present.
 */
const allCommandCardAssetsExist = async (
  assetStorage: AssetStorage,
  card: CommandCard,
): Promise<boolean> => {
  const exists = await allCardAssetsExist(
    { assetStorage, targets: commandCardAssetTargets },
    card,
  );
  return exists;
};

export { allCommandCardAssetsExist };
