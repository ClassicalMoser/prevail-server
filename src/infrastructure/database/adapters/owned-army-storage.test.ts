import {
  tempCommandCards,
  tempUnits,
} from '@classicalmoser/prevail-rules/domain';
import type { LoggerPort, OwnedArmyWrite, User, UserStorage } from '@ports';
import type { ArmyCommandCardDb, ArmyDb, ArmyUnitCardDb } from '../db-types';
import type { Sql } from '../sql-type';
import { createOwnedArmyStorage } from './owned-army-storage';

/**
 * This suite has no database. `begin` records each statement, applies it to
 * an in-memory army, and when a statement throws, restores the army from
 * before the transaction and rethrows.
 */

const armyId = 'army-1';

interface StoredArmy {
  name: string;
  unitCards: ArmyUnitCardDb[];
  commandCards: ArmyCommandCardDb[];
}

const copyArmy = (army: StoredArmy): StoredArmy => ({
  name: army.name,
  unitCards: army.unitCards.map((row) => ({ ...row })),
  commandCards: army.commandCards.map((row) => ({ ...row })),
});

const statementName = (strings: TemplateStringsArray): string => {
  const text = strings.join(' ');
  if (text.includes('UPDATE armies')) {
    return 'update armies';
  }
  if (text.includes('DELETE FROM army_unit_cards')) {
    return 'delete army_unit_cards';
  }
  if (text.includes('DELETE FROM army_command_cards')) {
    return 'delete army_command_cards';
  }
  if (text.includes('INSERT INTO army_unit_cards')) {
    return 'insert army_unit_cards';
  }
  if (text.includes('INSERT INTO army_command_cards')) {
    return 'insert army_command_cards';
  }
  return 'unknown';
};

const stringValue = (value: unknown, label: string): string => {
  if (typeof value !== 'string') {
    throw new TypeError(`${label} was not a string`);
  }
  return value;
};

const applyStatement = (
  name: string,
  values: readonly unknown[],
  army: StoredArmy,
): ArmyDb[] => {
  if (name === 'update armies') {
    const armyName = stringValue(values[0], 'army name');
    army.name = armyName;
    const row: ArmyDb = {
      army_id: armyId,
      army_name: armyName,
      user_id: 'user-1',
      public: false,
      archived_at: null,
    };
    return [row];
  }
  if (name === 'delete army_unit_cards') {
    army.unitCards = [];
    return [];
  }
  if (name === 'delete army_command_cards') {
    army.commandCards = [];
    return [];
  }
  if (name === 'insert army_unit_cards') {
    const unitCardId = stringValue(values[1], 'unit card id');
    const quantity = values[2];
    if (typeof quantity !== 'number') {
      throw new TypeError('quantity was not a number');
    }
    const row: ArmyUnitCardDb = {
      army_id: armyId,
      unit_card_id: unitCardId,
      quantity,
    };
    army.unitCards = [...army.unitCards, row];
    return [];
  }
  throw new Error(`unexpected statement ${name}`);
};

type StatementTag = (
  strings: TemplateStringsArray,
  ...values: readonly unknown[]
) => Promise<ArmyDb[]>;

const rollbackClient = (army: StoredArmy, attempted: string[]): Sql => {
  const begin = async (
    run: (tx: StatementTag) => Promise<boolean>,
  ): Promise<boolean> => {
    const snapshot = copyArmy(army);
    const tx: StatementTag = async (strings, ...values) => {
      const name = statementName(strings);
      attempted.push(name);
      if (name === 'insert army_command_cards') {
        throw new Error('command card insert failed');
      }
      const rows = applyStatement(name, values, army);
      return rows;
    };

    try {
      const outcome = await run(tx);
      return outcome;
    } catch (error) {
      army.name = snapshot.name;
      army.unitCards = snapshot.unitCards;
      army.commandCards = snapshot.commandCards;
      throw error;
    }
  };

  const client = { begin } as Sql; // begin-only double; Sql also owns the pool
  return client;
};

const logger: LoggerPort = {
  error: (): void => {
    /* records database failures; this test asserts the envelope */
  },
  info: (): void => {
    /* records database failures; this test asserts the envelope */
  },
  warn: (): void => {
    /* records database failures; this test asserts the envelope */
  },
};

const owner: User = {
  userId: 'user-1',
  authSub: 'auth0|owner',
};

const unused = async (): Promise<never> => {
  throw new Error('not used by updateOwnedArmy');
};

const ownerStorage: UserStorage = {
  getByUserId: unused,
  getByAuthSub: unused,
  ensureByAuthSub: async () => ({
    success: true,
    data: owner,
  }),
};

const renamedWrite = (): OwnedArmyWrite => {
  const unitType = tempUnits[0];
  const commandCard = tempCommandCards[0];
  const write: OwnedArmyWrite = {
    armyName: 'Renamed',
    units: [{ unitType, count: 4 }],
    commandCards: [commandCard],
  };
  return write;
};

const originalArmy = (): StoredArmy => ({
  name: 'Original',
  unitCards: [
    {
      army_id: armyId,
      unit_card_id: 'kept-unit',
      quantity: 2,
    },
  ],
  commandCards: [
    {
      army_id: armyId,
      command_card_id: 'kept-command',
      quantity: 1,
    },
  ],
});

describe('updateOwnedArmy function', () => {
  it(
    'leaves the army name and rows unchanged when a composition insert fails',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const army = originalArmy();
      const before = copyArmy(army);
      const attempted: string[] = [];
      const storage = createOwnedArmyStorage(
        logger,
        rollbackClient(army, attempted),
        ownerStorage,
      );
      const write = renamedWrite();

      const result = await storage.updateOwnedArmy(
        owner.authSub,
        armyId,
        write,
      );

      expect(result).toStrictEqual({
        success: false,
        message: 'Failed to update owned army in database',
        status: 500,
      });
      expect(attempted).toStrictEqual([
        'update armies',
        'delete army_unit_cards',
        'delete army_command_cards',
        'insert army_unit_cards',
        'insert army_command_cards',
      ]);
      expect(army).toStrictEqual(before);
    },
  );
});
