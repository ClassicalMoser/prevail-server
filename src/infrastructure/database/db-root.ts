import type { LoggerPort, StoragePort } from '@ports';
import { createCommandCardStorage } from './adapters';

import postgres from 'postgres';
import type { Sql } from './sql-type';

const createDbRoot = (
  logger: LoggerPort,
  connectionString: string,
): StoragePort => {
  const sql: Sql = postgres(connectionString);
  return {
    commandCardStorage: createCommandCardStorage(logger, sql),
  };
};

export { createDbRoot };
