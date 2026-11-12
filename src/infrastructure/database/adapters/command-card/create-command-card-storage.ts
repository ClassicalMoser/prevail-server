import type { LoggerPort, CommandCardStorage } from '@ports';
import type { Sql } from '@infrastructure/database/sql-type';
import { storageOp } from '../storage-op';
import { certifyCommandCardVersions } from './certify-command-card-versions';
import { createCommandCardVersion } from './create-command-card-version';
import { createEmptyCommandCard } from './create-empty-command-card';
import { deleteCommandCardVersion } from './delete-command-card-version';
import { deleteEmptyCommandCards } from './delete-empty-command-cards';
import { getAllCommandCards } from './get-all-command-cards';
import { getCommandCardById } from './get-command-card-by-id';
import { getCommandCardsByIds } from './get-command-cards-by-ids';
import { getCurrentCommandCards } from './get-current-command-cards';
import { getLatestCommandCardCertifications } from './get-latest-command-card-certifications';

/**
 * Postgres adapter for catalog command cards.
 *
 * Each operation is its own function; this hands each its connection and wraps
 * it in `storageOp`, so a thrown driver or schema error becomes a 500 envelope
 * once, here, rather than in every operation.
 *
 * @param logger - Where unexpected database failures are recorded.
 * @param sql - postgres.js client.
 * @returns The {@link CommandCardStorage} port.
 */
const createCommandCardStorage = (
  logger: LoggerPort,
  sql: Sql,
): CommandCardStorage => ({
  getCurrentCommandCards: () =>
    storageOp({
      logger,
      context: 'getting current command cards from database',
      message: 'Failed to get current command cards from database',
      run: () => getCurrentCommandCards(sql),
    }),

  getAllCommandCards: () =>
    storageOp({
      logger,
      context: 'getting all command cards from database',
      message: 'Failed to get all command cards from database',
      run: () => getAllCommandCards(sql),
    }),

  getCommandCardById: (id) =>
    storageOp({
      logger,
      context: 'getting command card by id from database',
      message: 'Failed to get command card by id from database',
      run: () => getCommandCardById(sql, id),
    }),

  getCommandCardsByIds: (ids) =>
    storageOp({
      logger,
      context: 'getting command cards by ids from database',
      message: 'Failed to get command cards by ids from database',
      run: () => getCommandCardsByIds(sql, ids),
    }),

  createEmptyCommandCard: () =>
    storageOp({
      logger,
      context: 'creating empty command card in database',
      message: 'Failed to create empty command card in database',
      run: () => createEmptyCommandCard(sql),
    }),

  deleteEmptyCommandCards: () =>
    storageOp({
      logger,
      context: 'deleting empty command cards from database',
      message: 'Failed to delete empty command cards from database',
      run: () => deleteEmptyCommandCards(sql),
    }),

  createCommandCardVersion: (card) =>
    storageOp({
      logger,
      context: 'creating command card version in database',
      message: 'Failed to create command card version in database',
      run: () => createCommandCardVersion(sql, card),
    }),

  deleteCommandCardVersion: (card) =>
    storageOp({
      logger,
      context: 'deleting command card version from database',
      message: 'Failed to delete command card version from database',
      run: () => deleteCommandCardVersion(sql, card),
    }),

  getLatestCommandCardCertifications: () =>
    storageOp({
      logger,
      context: 'getting latest command card certifications from database',
      message: 'Failed to get latest command card certifications from database',
      run: () => getLatestCommandCardCertifications(sql),
    }),

  certifyCommandCardVersions: (commandCardIds) =>
    storageOp({
      logger,
      context: 'certifying command card versions in database',
      message: 'Failed to certify command card versions in database',
      run: () => certifyCommandCardVersions(sql, commandCardIds),
    }),
});

export { createCommandCardStorage };
