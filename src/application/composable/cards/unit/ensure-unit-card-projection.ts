import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports';
import { ensureCardProjection } from '@application/composable/assets/ensure-card-projection';
import type { UnitCardProjectionDeps } from './unit-card-project-ops';
import { unitCardProjectOps } from './unit-card-project-ops';

/**
 * Render only the missing assets for one unit-card version.
 *
 * @param deps - Storage and unit-card renderer.
 * @param unitType - Unit type version to heal.
 * @returns Success when every missing target is stored, or the first failure.
 */
const ensureUnitCardProjection = async (
  deps: UnitCardProjectionDeps,
  unitType: UnitType,
): Promise<DataErrorSignature<void>> => {
  const ensured = await ensureCardProjection(
    unitCardProjectOps(deps),
    unitType,
  );
  return ensured;
};

export { ensureUnitCardProjection };
