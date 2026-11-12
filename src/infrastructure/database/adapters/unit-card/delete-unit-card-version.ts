import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports';
import { parseVersionTriple } from '@infrastructure/database/mappers';
import { deleteUnitCardVersionQuery } from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';
import { voidSuccess } from '../void-success';

/**
 * Delete one stored version of a unit card.
 *
 * The version is named by the card's own `version` text, which is split into
 * major, minor and patch to match the stored columns.
 *
 * @param sql - postgres.js client.
 * @param unitType - The unit card whose id and version name the row.
 * @returns An empty success, whether or not a row matched.
 */
const deleteUnitCardVersion = async (
  sql: Sql,
  unitType: UnitType,
): Promise<DataErrorSignature<void>> => {
  const { major, minor, patch } = parseVersionTriple(unitType.version);
  // The table stores the version as three numbers; the domain card carries the dotted text.
  await deleteUnitCardVersionQuery({
    sql,
    unitCardId: unitType.id,
    versionMajor: major,
    versionMinor: minor,
    versionPatch: patch,
  });
  return voidSuccess();
};

export { deleteUnitCardVersion };
