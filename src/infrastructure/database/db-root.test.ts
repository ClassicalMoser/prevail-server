import { createDbRoot } from './db-root';
import { recordingLogger } from '@testing';

const logger = recordingLogger();

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

      // The root hands out one storage port per concern (command cards, unit
      // cards, users, owned armies); each is checked by one method it must
      // carry.
      expect(storage.commandCardStorage.getCommandCardById).toBeTypeOf(
        'function',
      );
      expect(storage.unitCardStorage.getUnitCardById).toBeTypeOf('function');
      expect(storage.userStorage.getByAuthSub).toBeTypeOf('function');
      expect(storage.ownedArmyStorage.getOwnedArmies).toBeTypeOf('function');
    },
  );
});
