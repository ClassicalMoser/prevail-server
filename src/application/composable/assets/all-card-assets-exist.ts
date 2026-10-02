import type { ProjectCardAssetsOps } from './project-card-assets-ops';

/**
 * Whether every projected asset for this card version already exists.
 *
 * Used before certification so a card is not stamped until its print and
 * preview files are present.
 *
 * @param ops - Storage and target list for this card kind.
 * @param card - Card version to check.
 * @returns True when every target key exists in storage.
 */
const allCardAssetsExist = async <TCard>(
  ops: Pick<ProjectCardAssetsOps<TCard>, 'assetStorage' | 'targets'>,
  card: TCard,
): Promise<boolean> => {
  for (const target of ops.targets(card)) {
    if (!(await ops.assetStorage.objectExists(target.key))) {
      return false;
    }
  }
  return true;
};

export { allCardAssetsExist };
