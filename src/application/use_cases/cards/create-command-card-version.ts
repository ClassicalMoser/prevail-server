import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports';
import {
  buildUnitIdToNameMap,
  getCommandCardUnitIds,
  projectCommandCardVersion,
} from '@application/composable';
import type { CommandCardUseCasesDeps } from './command-card-use-cases-deps';

/**
 * Publish a new version of a command card: store it, then draw its assets.
 *
 * A version no one can print is worse than no version, so if the unit names
 * it needs cannot be resolved, or its assets cannot be drawn and stored, the
 * version row is deleted again and the failure is returned.
 *
 * @param deps - Command-card and unit-card storage, renderer, and asset ports.
 * @param card - The command card definition to store as a new version.
 * @returns The stored card, or the first failure.
 */
const createCommandCardVersion = async (
  deps: CommandCardUseCasesDeps,
  card: CommandCard,
): Promise<DataErrorSignature<CommandCard>> => {
  // Step 1: store the version. Storage owns the version number.
  const insertResult =
    await deps.commandCardStorage.createCommandCardVersion(card);
  if (!insertResult.success) {
    return insertResult;
  }

  // Step 2: a printed card shows the names of the units it supports.
  const nameMapResult = await buildUnitIdToNameMap(
    deps.unitCardStorage,
    getCommandCardUnitIds(insertResult.data),
  );
  if (!nameMapResult.success) {
    // Roll back: an unprintable version must not stay in the catalog.
    await deps.commandCardStorage.deleteCommandCardVersion(insertResult.data);
    return nameMapResult;
  }

  // Step 3: draw and store the card's images and print files.
  const projectResult = await projectCommandCardVersion(
    {
      assetStorage: deps.assetStorage,
      commandCardRenderer: deps.commandCardRenderer,
      unitIdToNameMap: nameMapResult.data,
    },
    // Merge storage's answer (id, version) so asset keys use the assigned version.
    { ...card, ...insertResult.data },
  );
  if (!projectResult.success) {
    // Roll back: an unprintable version must not stay in the catalog.
    await deps.commandCardStorage.deleteCommandCardVersion(insertResult.data);
    return projectResult;
  }

  return insertResult;
};

export { createCommandCardVersion };
