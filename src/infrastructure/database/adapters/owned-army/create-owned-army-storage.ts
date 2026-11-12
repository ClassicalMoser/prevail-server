import type { LoggerPort, OwnedArmyStorage, UserStorage } from '@ports';
import type { Sql } from '@infrastructure/database/sql-type';
import { storageOp } from '../storage-op';
import { archiveOwnedArmy } from './archive-owned-army';
import { createOwnedArmy } from './create-owned-army';
import { getOwnedArmies } from './get-owned-armies';
import { getOwnedArmyById } from './get-owned-army-by-id';
import { updateOwnedArmy } from './update-owned-army';

/**
 * Postgres adapter for player-owned armies.
 *
 * Every read and write is scoped by the owner's auth subject. Creating an
 * army ensures a local user row exists for that subject, then inserts the
 * army under that user. Archive sets `archived_at` and does not delete
 * composition history.
 *
 * Each operation is its own function; this only hands each its connection and
 * wraps it in `storageOp`, so a thrown driver error becomes a 500 envelope
 * once, here, rather than in every operation.
 *
 * @param logger - Where unexpected database failures are recorded.
 * @param sql - postgres.js client.
 * @param userStorage - Resolves or creates the owner from an auth subject.
 * @returns The {@link OwnedArmyStorage} port.
 */
const createOwnedArmyStorage = (
  logger: LoggerPort,
  sql: Sql,
  userStorage: UserStorage,
): OwnedArmyStorage => ({
  getOwnedArmies: (ownerAuthSub) =>
    storageOp({
      logger,
      context: 'getting owned armies from database',
      message: 'Failed to get owned armies from database',
      run: () => getOwnedArmies(sql, ownerAuthSub),
    }),

  getOwnedArmyById: (ownerAuthSub, armyId) =>
    storageOp({
      logger,
      context: 'getting owned army by id from database',
      message: 'Failed to get owned army from database',
      run: () => getOwnedArmyById(sql, ownerAuthSub, armyId),
    }),

  createOwnedArmy: (ownerAuthSub, armyName) =>
    storageOp({
      logger,
      context: 'creating owned army in database',
      message: 'Failed to create owned army in database',
      run: () => createOwnedArmy(sql, userStorage, ownerAuthSub, armyName),
    }),

  updateOwnedArmy: (ownerAuthSub, armyId, write) =>
    storageOp({
      logger,
      context: 'updating owned army in database',
      message: 'Failed to update owned army in database',
      run: () => updateOwnedArmy(sql, userStorage, ownerAuthSub, armyId, write),
    }),

  archiveOwnedArmy: (ownerAuthSub, armyId) =>
    storageOp({
      logger,
      context: 'archiving owned army in database',
      message: 'Failed to archive owned army in database',
      run: () => archiveOwnedArmy(sql, ownerAuthSub, armyId),
    }),
});

export { createOwnedArmyStorage };
