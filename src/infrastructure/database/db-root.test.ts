import type { LoggerPort } from '@ports';
import { createDbRoot } from './db-root';

const logger: LoggerPort = {
  error: (): void => {
    /* unused */
  },
  info: (): void => {
    /* unused */
  },
  warn: (): void => {
    /* unused */
  },
};

describe('createDbRoot function', () => {
  it(
    'assembles command, unit, user, and owned-army storage ports',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // postgres.js connects lazily on first query; this suite only builds adapters.
      const storage = createDbRoot(
        logger,
        'postgres://user:pass@127.0.0.1:1/none',
      );

      expect(storage.commandCardStorage.getCommandCardById).toBeTypeOf(
        'function',
      );
      expect(storage.unitCardStorage.getUnitCardById).toBeTypeOf('function');
      expect(storage.userStorage.getByAuthSub).toBeTypeOf('function');
      expect(storage.ownedArmyStorage.getOwnedArmies).toBeTypeOf('function');
    },
  );
});
