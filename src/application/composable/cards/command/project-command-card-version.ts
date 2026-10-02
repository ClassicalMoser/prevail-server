import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports';
import { projectCardVersion } from '@application/composable/assets/project-card-version';
import type { CommandCardProjectionDeps } from './command-card-project-ops';
import { commandCardProjectOps } from './command-card-project-ops';

/**
 * Render and store every asset for one command-card version.
 *
 * @param deps - Storage, renderer, and unit name map.
 * @param card - Command card version to project.
 * @returns Success when every target is stored, or the first failure.
 */
const projectCommandCardVersion = async (
  deps: CommandCardProjectionDeps,
  card: CommandCard,
): Promise<DataErrorSignature<void>> => {
  const projected = await projectCardVersion(commandCardProjectOps(deps), card);
  return projected;
};

export { projectCommandCardVersion };
