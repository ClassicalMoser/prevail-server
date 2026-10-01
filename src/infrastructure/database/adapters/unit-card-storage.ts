import type {
  CatalogCardListItem,
  DataErrorSignature,
  LoggerPort,
  UnitCardCertificationStatus,
  UnitCardStorage,
} from '@ports';
import {
  createEmptyUnitCardQuery,
  createUnitCardVersionQuery,
  deleteEmptyUnitCardsQuery,
  deleteUnitCardVersionQuery,
  getAllUnitCardsQuery,
  getCurrentUnitCardsQuery,
  getLatestUnitCardCertificationsQuery,
  getLatestRulesVersionIdQuery,
  getUnitCardByIdQuery,
  getUnitCardsByIdsQuery,
  insertUnitCardCertificationsQuery,
  unitCardExistsQuery,
} from '../queries';
import type {
  UnitCardCertificationStatusDb,
  UnitCardListItemDb,
  UnitCardVersionDb,
  WriteUnitCardVersionDb,
} from '../db-types';
import {
  parseVersionTriple,
  unitCardListItemMapper,
  unitCardVersionMapperToDomain,
  writeUnitCardVersionMapper,
} from '../mappers';
import type { Sql } from '../sql-type';
import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import { notFound, storageOp, voidSuccess } from './storage-op';

const mapUnitCardVersions = (versions: UnitCardVersionDb[]): UnitType[] =>
  versions.map((version) => unitCardVersionMapperToDomain(version));

/**
 * Postgres adapter for catalog unit cards.
 *
 * Current reads return the latest certified version of each unit type.
 * Artwork stays a column. Traits, stats, cost, limit, and morale stay in the
 * JSON definition. Certification uses the latest rules version, same as
 * command cards.
 *
 * @param logger - Where unexpected database failures are recorded.
 * @param sql - postgres.js client.
 * @returns The {@link UnitCardStorage} port.
 */
const createUnitCardStorage = (
  logger: LoggerPort,
  sql: Sql,
): UnitCardStorage => ({
  getCurrentUnitCards: (): Promise<DataErrorSignature<UnitType[]>> => {
    const stored = storageOp({
      logger,
      context: 'getting current unit cards from database',
      message: 'Failed to get current unit cards from database',
      run: async () => ({
        success: true,
        data: mapUnitCardVersions(await getCurrentUnitCardsQuery(sql)),
      }),
    });
    return stored;
  },

  getAllUnitCards: (): Promise<DataErrorSignature<CatalogCardListItem[]>> => {
    const stored = storageOp({
      logger,
      context: 'getting all unit cards from database',
      message: 'Failed to get all unit cards from database',
      run: async () => {
        const rows: UnitCardListItemDb[] = await getAllUnitCardsQuery(sql);
        return {
          success: true,
          data: rows.map((row) => unitCardListItemMapper(row)),
        };
      },
    });
    return stored;
  },

  getUnitCardById: (id: string): Promise<DataErrorSignature<UnitType>> => {
    const stored = storageOp({
      logger,
      context: 'getting unit card by id from database',
      message: 'Failed to get unit card by id from database',
      run: async () => {
        const rows: UnitCardVersionDb[] = await getUnitCardByIdQuery(sql, id);
        if (rows.length === 0) {
          const storedCall = notFound('Unit card not found');
          return storedCall;
        }
        return {
          success: true,
          data: unitCardVersionMapperToDomain(rows[0]),
        };
      },
    });
    return stored;
  },

  getUnitCardsByIds: (
    ids: string[],
  ): Promise<DataErrorSignature<UnitType[]>> => {
    const stored = storageOp({
      logger,
      context: 'getting unit cards by ids from database',
      message: 'Failed to get unit cards by ids from database',
      run: async () => {
        if (ids.length === 0) {
          return { success: true, data: [] };
        }
        return {
          success: true,
          data: mapUnitCardVersions(await getUnitCardsByIdsQuery(sql, ids)),
        };
      },
    });
    return stored;
  },

  createEmptyUnitCard: (): Promise<DataErrorSignature<string>> => {
    const stored = storageOp({
      logger,
      context: 'creating empty unit card in database',
      message: 'Failed to create empty unit card in database',
      run: async () => {
        const rows: { unit_card_id: string }[] =
          await createEmptyUnitCardQuery(sql);
        return { success: true, data: rows[0].unit_card_id };
      },
    });
    return stored;
  },

  deleteEmptyUnitCards: (): Promise<DataErrorSignature<void>> => {
    const stored = storageOp({
      logger,
      context: 'deleting empty unit cards from database',
      message: 'Failed to delete empty unit cards from database',
      run: async () => {
        await deleteEmptyUnitCardsQuery(sql);
        const storedCall = voidSuccess();
        return storedCall;
      },
    });
    return stored;
  },

  createUnitCardVersion: (
    unitType: UnitType,
  ): Promise<DataErrorSignature<UnitType>> => {
    const stored = storageOp({
      logger,
      context: 'creating unit card version in database',
      message: 'Failed to create unit card version in database',
      run: async () => {
        const existingCard = await unitCardExistsQuery(sql, unitType.id);
        if (existingCard.length === 0) {
          const storedCall = notFound('Unit card not found');
          return storedCall;
        }

        const writeVersion: WriteUnitCardVersionDb =
          writeUnitCardVersionMapper(unitType);
        const rows: UnitCardVersionDb[] = await createUnitCardVersionQuery(
          sql,
          writeVersion,
        );

        return {
          success: true,
          data: unitCardVersionMapperToDomain(rows[0]),
        };
      },
    });
    return stored;
  },

  deleteUnitCardVersion: (
    unitType: UnitType,
  ): Promise<DataErrorSignature<void>> => {
    const stored = storageOp({
      logger,
      context: 'deleting unit card version from database',
      message: 'Failed to delete unit card version from database',
      run: async () => {
        const { major, minor, patch } = parseVersionTriple(unitType.version);
        await deleteUnitCardVersionQuery({
          sql,
          unitCardId: unitType.id,
          versionMajor: major,
          versionMinor: minor,
          versionPatch: patch,
        });
        const storedCall = voidSuccess();
        return storedCall;
      },
    });
    return stored;
  },

  getLatestUnitCardCertifications: (): Promise<
    DataErrorSignature<UnitCardCertificationStatus[]>
  > => {
    const stored = storageOp({
      logger,
      context: 'getting latest unit card certifications from database',
      message: 'Failed to get latest unit card certifications from database',
      run: async () => {
        const rows: UnitCardCertificationStatusDb[] =
          await getLatestUnitCardCertificationsQuery(sql);
        return {
          success: true,
          data: rows.map((row) => ({
            card: unitCardVersionMapperToDomain(row),
            certified: row.certified,
          })),
        };
      },
    });
    return stored;
  },

  certifyUnitCardVersions: (
    unitCardIds: string[],
  ): Promise<DataErrorSignature<void>> => {
    const stored = storageOp({
      logger,
      context: 'certifying unit card versions in database',
      message: 'Failed to certify unit card versions in database',
      run: async () => {
        if (unitCardIds.length === 0) {
          const storedCall = voidSuccess();
          return storedCall;
        }

        const rulesVersionRows = await getLatestRulesVersionIdQuery(sql);
        if (rulesVersionRows.length === 0) {
          return {
            success: false,
            message: 'No rules version found',
            status: 500,
          };
        }

        await insertUnitCardCertificationsQuery(
          sql,
          unitCardIds,
          rulesVersionRows[0].rules_version_id,
        );
        const storedCall = voidSuccess();
        return storedCall;
      },
    });
    return stored;
  },
});

export { createUnitCardStorage };
