import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { CommandCardVersionDb } from '../db-types';
import { commandCardVersionMapperToDomain } from './command-card-version-to-domain';
import { sortCommandCardsByInitiative } from './sort-command-cards-by-initiative';

/**
 * Map a batch of version rows into domain cards, initiative ascending.
 *
 * @param versions - Version rows for one fetch.
 * @returns Domain cards in initiative order.
 */
const mapCommandCardVersions = (
  versions: readonly CommandCardVersionDb[],
): CommandCard[] => {
  const cards = versions.map((version) =>
    commandCardVersionMapperToDomain(version),
  );
  const sorted = sortCommandCardsByInitiative(cards);
  return sorted;
};

export { mapCommandCardVersions };
