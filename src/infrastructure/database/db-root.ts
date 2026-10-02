import type { LoggerPort, StoragePort } from '@ports';
import {
  createCommandCardStorage,
  createOwnedArmyStorage,
  createUnitCardStorage,
  createUserStorage,
} from './adapters';

import postgres from 'postgres';
import type { Sql } from './sql-type';

/**
 * Open one Postgres client and wire every catalog/army storage adapter.
 *
 * @param logger - Logger passed into each adapter for storageOp failures.
 * @param connectionString - Postgres URL from process env.
 * @returns Aggregate {@link StoragePort} for use-case factories.
 */
const createDbRoot = (
  logger: LoggerPort,
  connectionString: string,
): StoragePort => {
  const sql: Sql = postgres(connectionString);
  const userStorage = createUserStorage(logger, sql);
  return {
    commandCardStorage: createCommandCardStorage(logger, sql),
    unitCardStorage: createUnitCardStorage(logger, sql),
    userStorage,
    ownedArmyStorage: createOwnedArmyStorage(logger, sql, userStorage),
  };
};

export { createDbRoot };
