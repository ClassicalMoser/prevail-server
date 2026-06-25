import type {
  PartialUnitType,
  UnitCardVersionDb,
  WriteUnitCardVersionDb,
} from '../db-types';
import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import { parseIfJson } from '../parse-if-json';

const unitCardVersionMapperToDomain = (
  version: UnitCardVersionDb,
): UnitType => {
  const partialUnitType: PartialUnitType = parseIfJson(
    version.unit_card_definition,
  );
  const versionNumber = `${version.version_major}.${version.version_minor}.${version.version_patch}`;

  return {
    id: version.unit_card_id,
    name: version.unit_card_name,
    ...partialUnitType,
    version: versionNumber,
  };
};

const writeUnitCardVersionMapper = (
  unitType: UnitType,
): WriteUnitCardVersionDb => {
  const majorVersion = Number.parseInt(unitType.version.split('.')[0], 10);
  const minorVersion = Number.parseInt(unitType.version.split('.')[1], 10);
  const patchVersion = Number.parseInt(unitType.version.split('.')[2], 10);

  const definition = {
    traits: unitType.traits,
    stats: unitType.stats,
    cost: unitType.cost,
    limit: unitType.limit,
    routPenalty: unitType.routPenalty,
  };

  return {
    unit_card_id: unitType.id,
    unit_card_name: unitType.name,
    unit_card_definition: JSON.stringify(definition),
    version_major: majorVersion,
    version_minor: minorVersion,
    version_patch: patchVersion,
  };
};

export { unitCardVersionMapperToDomain, writeUnitCardVersionMapper };
