import type {
  DataErrorSignature,
  LoggerPort,
  UnitCardCertificationStatus,
  UnitCardStorage,
} from '@ports';
import {
  createEmptyUnitCardQuery,
  createUnitCardVersionQuery,
  deleteEmptyUnitCardsQuery,
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
  unitCardListItemMapper,
  unitCardVersionMapperToDomain,
  writeUnitCardVersionMapper,
} from '../mappers';
import type { Sql } from '../sql-type';
import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { CardListItem } from '@classicalmoser/prevail-contracts';
import { handleError } from '@utils';

const mapUnitCardVersions = (versions: UnitCardVersionDb[]): UnitType[] =>
  versions.map((version) => unitCardVersionMapperToDomain(version));

const createUnitCardStorage = (
  logger: LoggerPort,
  sql: Sql,
): UnitCardStorage => ({
  getCurrentUnitCards: async (): Promise<DataErrorSignature<UnitType[]>> => {
    try {
      const unparsedResult: UnitCardVersionDb[] =
        await getCurrentUnitCardsQuery(sql);
      return {
        success: true,
        data: mapUnitCardVersions(unparsedResult),
      };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'getting current unit cards from database',
        message: 'Failed to get current unit cards from database',
        status: 500,
      });
    }
  },

  getAllUnitCards: async (): Promise<DataErrorSignature<CardListItem[]>> => {
    try {
      const unparsedResult: UnitCardListItemDb[] =
        await getAllUnitCardsQuery(sql);
      return {
        success: true,
        data: unparsedResult.map((row) => unitCardListItemMapper(row)),
      };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'getting all unit cards from database',
        message: 'Failed to get all unit cards from database',
        status: 500,
      });
    }
  },

  getUnitCardById: async (
    id: string,
  ): Promise<DataErrorSignature<UnitType>> => {
    try {
      const unparsedResult: UnitCardVersionDb[] = await getUnitCardByIdQuery(
        sql,
        id,
      );
      if (unparsedResult.length === 0) {
        return {
          success: false,
          message: 'Unit card not found',
          status: 404,
        };
      }

      return {
        success: true,
        data: unitCardVersionMapperToDomain(unparsedResult[0]),
      };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'getting unit card by id from database',
        message: 'Failed to get unit card by id from database',
        status: 500,
      });
    }
  },

  getUnitCardsByIds: async (
    ids: string[],
  ): Promise<DataErrorSignature<UnitType[]>> => {
    try {
      if (ids.length === 0) {
        return { success: true, data: [] };
      }

      const unparsedResult: UnitCardVersionDb[] = await getUnitCardsByIdsQuery(
        sql,
        ids,
      );
      return {
        success: true,
        data: mapUnitCardVersions(unparsedResult),
      };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'getting unit cards by ids from database',
        message: 'Failed to get unit cards by ids from database',
        status: 500,
      });
    }
  },

  createEmptyUnitCard: async (): Promise<DataErrorSignature<string>> => {
    try {
      const unparsedResult: { unit_card_id: string }[] =
        await createEmptyUnitCardQuery(sql);
      return {
        success: true,
        data: unparsedResult[0].unit_card_id,
      };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'creating empty unit card in database',
        message: 'Failed to create empty unit card in database',
        status: 500,
      });
    }
  },

  deleteEmptyUnitCards: async (): Promise<DataErrorSignature<void>> => {
    try {
      await deleteEmptyUnitCardsQuery(sql);
      return { success: true, data: undefined };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'deleting empty unit cards from database',
        message: 'Failed to delete empty unit cards from database',
        status: 500,
      });
    }
  },

  createUnitCardVersion: async (
    unitType: UnitType,
  ): Promise<DataErrorSignature<UnitType>> => {
    try {
      const existingCard = await unitCardExistsQuery(sql, unitType.id);
      if (existingCard.length === 0) {
        return {
          success: false,
          message: 'Unit card not found',
          status: 404,
        };
      }

      const writeVersion: WriteUnitCardVersionDb =
        writeUnitCardVersionMapper(unitType);
      const unparsedResult: UnitCardVersionDb[] =
        await createUnitCardVersionQuery(sql, writeVersion);

      return {
        success: true,
        data: unitCardVersionMapperToDomain(unparsedResult[0]),
      };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'creating unit card version in database',
        message: 'Failed to create unit card version in database',
        status: 500,
      });
    }
  },

  getLatestUnitCardCertifications: async (): Promise<
    DataErrorSignature<UnitCardCertificationStatus[]>
  > => {
    try {
      const rows: UnitCardCertificationStatusDb[] =
        await getLatestUnitCardCertificationsQuery(sql);
      return {
        success: true,
        data: rows.map((row) => ({
          card: unitCardVersionMapperToDomain(row),
          certified: row.certified,
        })),
      };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'getting latest unit card certifications from database',
        message: 'Failed to get latest unit card certifications from database',
        status: 500,
      });
    }
  },

  certifyUnitCardVersions: async (
    unitCardIds: string[],
  ): Promise<DataErrorSignature<void>> => {
    try {
      if (unitCardIds.length === 0) {
        return { success: true, data: undefined };
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

      return { success: true, data: undefined };
    } catch (error) {
      return handleError({
        error,
        logger,
        context: 'certifying unit card versions in database',
        message: 'Failed to certify unit card versions in database',
        status: 500,
      });
    }
  },
});

export { createUnitCardStorage };
