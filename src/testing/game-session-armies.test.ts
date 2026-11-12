import { armySchemaForMode } from '@classicalmoser/prevail-rules/domain';
import {
  army,
  miniArmy,
  ownedArmyStorage,
  standardArmy,
  whiteArmyId,
} from './game-session-armies';

describe('army function', () => {
  it(
    'builds an empty composition under the id this test set',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // The plain army has an empty composition: enough for cases that only
      // need an owned army id.
      expect(army(whiteArmyId)).toStrictEqual({
        commandCards: [],
        id: whiteArmyId,
        name: 'Test Army',
        units: [],
      });
    },
  );
});

describe('miniArmy function', () => {
  it(
    'fills a mini-mode-legal command set and one unit',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // Built against the rules, so a mini game accepts it.
      const built = miniArmy(whiteArmyId);

      // The rules' own mini army schema accepts it, so a start-game test is not
      // failing on a bad army.
      expect(armySchemaForMode('mini').safeParse(built).success).toBe(true);
      // The built mini army carries eight command cards.
      expect(built.commandCards).toHaveLength(8);
      expect(built.units).toHaveLength(1);
    },
  );
});

describe('standardArmy function', () => {
  it(
    'fills a standard-mode-legal command set and one unit',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // Built against the rules, so a standard game accepts it.
      const built = standardArmy(whiteArmyId);

      // The rules' own standard army schema accepts it.
      expect(armySchemaForMode('standard').safeParse(built).success).toBe(true);
      // The built standard army carries twelve command cards.
      expect(built.commandCards).toHaveLength(12);
    },
  );
});

describe('ownedArmyStorage function', () => {
  it(
    'returns a registered army by id and 404s a missing one',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // A storage that knows exactly one army, registered by id.
      const storage = ownedArmyStorage({
        [whiteArmyId]: army(whiteArmyId),
      });
      // Look up the registered id and an unknown id for the same subject.
      const found = await storage.getOwnedArmyById('auth0|owner', whiteArmyId);
      const missing = await storage.getOwnedArmyById('auth0|owner', 'missing');

      // The registered army is found.
      expect(found).toStrictEqual({
        data: army(whiteArmyId),
        success: true,
      });
      // An unregistered id is a 404, as with the real storage.
      expect(missing).toStrictEqual({
        message: 'Not found',
        status: 404,
        success: false,
      });
    },
  );
});
