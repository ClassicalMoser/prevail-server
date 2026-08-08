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

const createUnitCardStorage = (
  logger: LoggerPort,
  sql: Sql,
): UnitCardStorage => ({
  getCurrentUnitCards: (): Promise<DataErrorSignature<UnitType[]>> =>
    storageOp({
      logger,
      context: 'getting current unit cards from database',
      message: 'Failed to get current unit cards from database',
      run: async () => ({
        success: true,
        data: mapUnitCardVersions(await getCurrentUnitCardsQuery(sql)),
      }),
    }),

  getAllUnitCards: (): Promise<DataErrorSignature<CatalogCardListItem[]>> =>
    storageOp({
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
    }),

  getUnitCardById: (id: string): Promise<DataErrorSignature<UnitType>> =>
    storageOp({
      logger,
      context: 'getting unit card by id from database',
      message: 'Failed to get unit card by id from database',
      run: async () => {
        const rows: UnitCardVersionDb[] = await getUnitCardByIdQuery(sql, id);
        if (rows.length === 0) {
          return notFound('Unit card not found');
        }
        return {
          success: true,
          data: unitCardVersionMapperToDomain(rows[0]),
        };
      },
    }),

  getUnitCardsByIds: (ids: string[]): Promise<DataErrorSignature<UnitType[]>> =>
    storageOp({
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
    }),

  createEmptyUnitCard: (): Promise<DataErrorSignature<string>> =>
    storageOp({
      logger,
      context: 'creating empty unit card in database',
      message: 'Failed to create empty unit card in database',
      run: async () => {
        const rows: { unit_card_id: string }[] =
          await createEmptyUnitCardQuery(sql);
        return { success: true, data: rows[0].unit_card_id };
      },
    }),

  deleteEmptyUnitCards: (): Promise<DataErrorSignature<void>> =>
    storageOp({
      logger,
      context: 'deleting empty unit cards from database',
      message: 'Failed to delete empty unit cards from database',
      run: async () => {
        await deleteEmptyUnitCardsQuery(sql);
        return voidSuccess();
      },
    }),

  createUnitCardVersion: (
    unitType: UnitType,
  ): Promise<DataErrorSignature<UnitType>> =>
    storageOp({
      logger,
      context: 'creating unit card version in database',
      message: 'Failed to create unit card version in database',
      run: async () => {
        const existingCard = await unitCardExistsQuery(sql, unitType.id);
        if (existingCard.length === 0) {
          return notFound('Unit card not found');
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
    }),

  deleteUnitCardVersion: (
    unitType: UnitType,
  ): Promise<DataErrorSignature<void>> =>
    storageOp({
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
        return voidSuccess();
      },
    }),

  getLatestUnitCardCertifications: (): Promise<
    DataErrorSignature<UnitCardCertificationStatus[]>
  > =>
    storageOp({
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
    }),

  certifyUnitCardVersions: (
    unitCardIds: string[],
  ): Promise<DataErrorSignature<void>> =>
    storageOp({
      logger,
      context: 'certifying unit card versions in database',
      message: 'Failed to certify unit card versions in database',
      run: async () => {
        if (unitCardIds.length === 0) {
          return voidSuccess();
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
        return voidSuccess();
      },
    }),
});

export { createUnitCardStorage };
