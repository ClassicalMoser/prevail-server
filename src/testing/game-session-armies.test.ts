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

      const built = miniArmy(whiteArmyId);

      expect(armySchemaForMode('mini').safeParse(built).success).toBe(true);
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

      const built = standardArmy(whiteArmyId);

      expect(armySchemaForMode('standard').safeParse(built).success).toBe(true);
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

      const storage = ownedArmyStorage({
        [whiteArmyId]: army(whiteArmyId),
      });
      const found = await storage.getOwnedArmyById('auth0|owner', whiteArmyId);
      const missing = await storage.getOwnedArmyById('auth0|owner', 'missing');

      expect(found).toStrictEqual({
        data: army(whiteArmyId),
        success: true,
      });
      expect(missing).toStrictEqual({
        message: 'Not found',
        status: 404,
        success: false,
      });
    },
  );
});
