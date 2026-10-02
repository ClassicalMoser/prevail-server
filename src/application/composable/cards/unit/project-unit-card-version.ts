import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports';
import { projectCardVersion } from '@application/composable/assets/project-card-version';
import type { UnitCardProjectionDeps } from './unit-card-project-ops';
import { unitCardProjectOps } from './unit-card-project-ops';

/**
 * Render and store every asset for one unit-card version.
 *
 * @param deps - Storage and unit-card renderer.
 * @param unitType - Unit type version to project.
 * @returns Success when every target is stored, or the first failure.
 */
const projectUnitCardVersion = async (
  deps: UnitCardProjectionDeps,
  unitType: UnitType,
): Promise<DataErrorSignature<void>> => {
  const projected = await projectCardVersion(
    unitCardProjectOps(deps),
    unitType,
  );
  return projected;
};

export { projectUnitCardVersion };
