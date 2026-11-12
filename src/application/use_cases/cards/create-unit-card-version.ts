import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports';
import { projectUnitCardVersion } from '@application/composable';
import type { UnitCardUseCasesDeps } from './unit-card-use-cases-deps';

/**
 * Publish a new version of a unit card: store it, then draw its assets.
 *
 * A version no one can print is worse than no version, so if its assets
 * cannot be drawn and stored, the version row is deleted again and the
 * failure is returned.
 *
 * @param deps - Unit-card storage, renderer, and asset ports.
 * @param unitType - The unit definition to store as a new version.
 * @returns The stored unit type, or the first failure.
 */
const createUnitCardVersion = async (
  deps: UnitCardUseCasesDeps,
  unitType: UnitType,
): Promise<DataErrorSignature<UnitType>> => {
  // Step 1: store the version. Storage owns the version number.
  const insertResult =
    await deps.unitCardStorage.createUnitCardVersion(unitType);
  if (!insertResult.success) {
    return insertResult;
  }

  // Step 2: draw and store the card's images and print files.
  const projectResult = await projectUnitCardVersion(
    {
      assetStorage: deps.assetStorage,
      unitCardRenderer: deps.unitCardRenderer,
    },
    // Merge storage's answer (id, version) so asset keys use the assigned version.
    { ...unitType, ...insertResult.data },
  );
  if (!projectResult.success) {
    // Roll back: an unprintable version must not stay in the catalog.
    await deps.unitCardStorage.deleteUnitCardVersion(insertResult.data);
    return projectResult;
  }

  return insertResult;
};

export { createUnitCardVersion };
