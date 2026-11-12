import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports';
import type {
  UnitCardVersionDb,
  WriteUnitCardVersionDb,
} from '@infrastructure/database/db-types';
import {
  unitCardVersionMapperToDomain,
  writeUnitCardVersionMapper,
} from '@infrastructure/database/mappers';
import {
  createUnitCardVersionQuery,
  unitCardExistsQuery,
} from '@infrastructure/database/queries';
import type { Sql } from '@infrastructure/database/sql-type';
import { notFound } from '../not-found';

/**
 * Store a new version of an existing unit card.
 *
 * The unit card must already exist (see `createEmptyUnitCard`). The write mapper
 * validates the unit card against its schema before insert, so an invalid unit card
 * throws out of the caller's `storageOp` and becomes an error envelope.
 *
 * @param sql - postgres.js client.
 * @param unitType - The unit card definition to store as a new version.
 * @returns The stored unit card, or a 404 envelope when its id is unknown.
 */
const createUnitCardVersion = async (
  sql: Sql,
  unitType: UnitType,
): Promise<DataErrorSignature<UnitType>> => {
  const existing = await unitCardExistsQuery(sql, unitType.id);
  if (existing.length === 0) {
    return notFound('Unit card not found');
  }

  const writeVersion: WriteUnitCardVersionDb =
    writeUnitCardVersionMapper(unitType);
  const rows: UnitCardVersionDb[] = await createUnitCardVersionQuery(
    sql,
    writeVersion,
  );
  const created: DataErrorSignature<UnitType> = {
    success: true,
    data: unitCardVersionMapperToDomain(rows[0]),
  };
  return created;
};

export { createUnitCardVersion };
