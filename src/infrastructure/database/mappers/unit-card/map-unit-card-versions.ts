import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { UnitCardVersionDb } from '@infrastructure/database/db-types';
import { unitCardVersionMapperToDomain } from './unit-card-version-to-domain';

/**
 * Map a batch of version rows into domain unit types, in the order given.
 *
 * Command cards are sorted by initiative when mapped; unit types are not
 * sorted, so the order the query returned is kept.
 *
 * @param versions - Version rows for one fetch.
 * @returns Domain unit types, one per row.
 */
const mapUnitCardVersions = (
  versions: readonly UnitCardVersionDb[],
): UnitType[] => {
  const unitTypes = versions.map((version) =>
    unitCardVersionMapperToDomain(version),
  );
  return unitTypes;
};

export { mapUnitCardVersions };
