import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import { parseIfJson } from '../parse-if-json';
import type { PartialUnitType, UnitCardVersionDb } from '../db-types';
import { formatVersionTriple } from './format-version-triple';

/**
 * Rebuild a domain unit type from a version row.
 *
 * Artwork stays a column. Traits, stats, cost, limit, and morale come from
 * the JSON definition. The version string is the triple columns, not whatever
 * might have been stored inside the JSON.
 *
 * @param version - One unit-card version row.
 * @returns The domain unit type.
 */
const unitCardVersionMapperToDomain = (
  version: UnitCardVersionDb,
): UnitType => {
  const partialUnitType: PartialUnitType = parseIfJson(
    version.unit_card_definition,
  );
  const versionLabel = formatVersionTriple({
    major: version.version_major,
    minor: version.version_minor,
    patch: version.version_patch,
  });
  const unitType: UnitType = {
    id: version.unit_card_id,
    name: version.unit_card_name,
    imageUrl: version.unit_card_artwork_url,
    ...partialUnitType,
    version: versionLabel,
  };
  return unitType;
};

export { unitCardVersionMapperToDomain };
