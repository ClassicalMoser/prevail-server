import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { WriteUnitCardVersionDb } from '../db-types';
import { parseVersionTriple } from './parse-version-triple';

/**
 * Split a domain unit type into columns plus a JSON definition.
 *
 * The definition holds the rules payload. Identity, name, artwork, and the
 * version triple are columns.
 *
 * @param unitType - Domain unit type to persist as a new version.
 * @returns The row shape the insert query expects.
 */
const writeUnitCardVersionMapper = (
  unitType: UnitType,
): WriteUnitCardVersionDb => {
  const versionTriple = parseVersionTriple(unitType.version);
  const definition = {
    traits: unitType.traits,
    stats: unitType.stats,
    cost: unitType.cost,
    limit: unitType.limit,
    morale: unitType.morale,
  };
  const unitWrite: WriteUnitCardVersionDb = {
    unit_card_id: unitType.id,
    unit_card_artwork_url: unitType.imageUrl,
    unit_card_name: unitType.name,
    unit_card_definition: JSON.stringify(definition),
    version_major: versionTriple.major,
    version_minor: versionTriple.minor,
    version_patch: versionTriple.patch,
  };
  return unitWrite;
};

export { writeUnitCardVersionMapper };
