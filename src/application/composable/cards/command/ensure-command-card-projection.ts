import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports';
import { ensureCardProjection } from '@application/composable/assets/ensure-card-projection';
import type { CommandCardProjectionDeps } from './command-card-project-ops';
import { commandCardProjectOps } from './command-card-project-ops';

/**
 * Render only the missing assets for one command-card version.
 *
 * @param deps - Storage, renderer, and unit name map.
 * @param card - Command card version to heal.
 * @returns Success when every missing target is stored, or the first failure.
 */
const ensureCommandCardProjection = async (
  deps: CommandCardProjectionDeps,
  card: CommandCard,
): Promise<DataErrorSignature<void>> => {
  const ensured = await ensureCardProjection(commandCardProjectOps(deps), card);
  return ensured;
};

export { ensureCommandCardProjection };
