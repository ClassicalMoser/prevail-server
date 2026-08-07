import type { LoggerPort, StoragePort } from '@ports';
import {
  createCommandCardStorage,
  createOwnedArmyStorage,
  createUnitCardStorage,
  createUserStorage,
} from './adapters';

import postgres from 'postgres';
import type { Sql } from './sql-type';

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
