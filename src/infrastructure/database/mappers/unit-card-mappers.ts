import type {
  PartialUnitType,
  UnitCardVersionDb,
  WriteUnitCardVersionDb,
} from '../db-types';
import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import { parseIfJson } from '../parse-if-json';
import { formatVersionTriple, parseVersionTriple } from './version-mappers';

const unitCardVersionMapperToDomain = (
  version: UnitCardVersionDb,
): UnitType => {
  const partialUnitType: PartialUnitType = parseIfJson(
    version.unit_card_definition,
  );

  return {
    id: version.unit_card_id,
    name: version.unit_card_name,
    imageUrl: version.unit_card_artwork_url,
    ...partialUnitType,
    version: formatVersionTriple({
      major: version.version_major,
      minor: version.version_minor,
      patch: version.version_patch,
    }),
  };
};

const writeUnitCardVersionMapper = (
  unitType: UnitType,
): WriteUnitCardVersionDb => {
  const { major, minor, patch } = parseVersionTriple(unitType.version);

  const definition = {
    traits: unitType.traits,
    stats: unitType.stats,
    cost: unitType.cost,
    limit: unitType.limit,
    morale: unitType.morale,
  };

  return {
    unit_card_id: unitType.id,
    unit_card_artwork_url: unitType.imageUrl,
    unit_card_name: unitType.name,
    unit_card_definition: JSON.stringify(definition),
    version_major: major,
    version_minor: minor,
    version_patch: patch,
  };
};

export { unitCardVersionMapperToDomain, writeUnitCardVersionMapper };
