import type { LoggerPort, UnitCardStorage } from '@ports';
import type { Sql } from '@infrastructure/database/sql-type';
import { storageOp } from '../storage-op';
import { certifyUnitCardVersions } from './certify-unit-card-versions';
import { createEmptyUnitCard } from './create-empty-unit-card';
import { createUnitCardVersion } from './create-unit-card-version';
import { deleteEmptyUnitCards } from './delete-empty-unit-cards';
import { deleteUnitCardVersion } from './delete-unit-card-version';
import { getAllUnitCards } from './get-all-unit-cards';
import { getCurrentUnitCards } from './get-current-unit-cards';
import { getLatestUnitCardCertifications } from './get-latest-unit-card-certifications';
import { getUnitCardById } from './get-unit-card-by-id';
import { getUnitCardsByIds } from './get-unit-cards-by-ids';

/**
 * Postgres adapter for catalog unit cards.
 *
 * Each operation is its own function; this hands each its connection and wraps
 * it in `storageOp`, so a thrown driver or schema error becomes a 500 envelope
 * once, here, rather than in every operation.
 *
 * @param logger - Where unexpected database failures are recorded.
 * @param sql - postgres.js client.
 * @returns The {@link UnitCardStorage} port.
 */
const createUnitCardStorage = (
  logger: LoggerPort,
  sql: Sql,
): UnitCardStorage => ({
  getCurrentUnitCards: () =>
    storageOp({
      logger,
      context: 'getting current unit cards from database',
      message: 'Failed to get current unit cards from database',
      run: () => getCurrentUnitCards(sql),
    }),

  getAllUnitCards: () =>
    storageOp({
      logger,
      context: 'getting all unit cards from database',
      message: 'Failed to get all unit cards from database',
      run: () => getAllUnitCards(sql),
    }),

  getUnitCardById: (id) =>
    storageOp({
      logger,
      context: 'getting unit card by id from database',
      message: 'Failed to get unit card by id from database',
      run: () => getUnitCardById(sql, id),
    }),

  getUnitCardsByIds: (ids) =>
    storageOp({
      logger,
      context: 'getting unit cards by ids from database',
      message: 'Failed to get unit cards by ids from database',
      run: () => getUnitCardsByIds(sql, ids),
    }),

  createEmptyUnitCard: () =>
    storageOp({
      logger,
      context: 'creating empty unit card in database',
      message: 'Failed to create empty unit card in database',
      run: () => createEmptyUnitCard(sql),
    }),

  deleteEmptyUnitCards: () =>
    storageOp({
      logger,
      context: 'deleting empty unit cards from database',
      message: 'Failed to delete empty unit cards from database',
      run: () => deleteEmptyUnitCards(sql),
    }),

  createUnitCardVersion: (unitType) =>
    storageOp({
      logger,
      context: 'creating unit card version in database',
      message: 'Failed to create unit card version in database',
      run: () => createUnitCardVersion(sql, unitType),
    }),

  deleteUnitCardVersion: (unitType) =>
    storageOp({
      logger,
      context: 'deleting unit card version from database',
      message: 'Failed to delete unit card version from database',
      run: () => deleteUnitCardVersion(sql, unitType),
    }),

  getLatestUnitCardCertifications: () =>
    storageOp({
      logger,
      context: 'getting latest unit card certifications from database',
      message: 'Failed to get latest unit card certifications from database',
      run: () => getLatestUnitCardCertifications(sql),
    }),

  certifyUnitCardVersions: (unitCardIds) =>
    storageOp({
      logger,
      context: 'certifying unit card versions in database',
      message: 'Failed to certify unit card versions in database',
      run: () => certifyUnitCardVersions(sql, unitCardIds),
    }),
});

export { createUnitCardStorage };
