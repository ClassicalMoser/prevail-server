import type { OwnedArmyWrite } from '@ports';
import type {
  ArmyCommandCardDb,
  ArmyDb,
  ArmyUnitCardDb,
} from '@infrastructure/database/db-types';
import type { Sql } from '@infrastructure/database/sql-type';
import { saveOwnedArmy } from './save-owned-army';
import { tempCommandCards, tempUnits } from '@testing';

/**
 * This suite has no database. `begin` records each statement, applies it to
 * an in-memory army, and when a statement throws, restores the army from
 * before the transaction and rethrows.
 */

// One army id shared by the stored army and the statements.
const armyId = 'army-1';

// The in-memory stand-in for one army's name and join rows.
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

// Classifies each recorded statement by its text, so the double can apply it.
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

// Applies one statement to the in-memory army, as the database would.
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

// A begin-only client: it plays the transaction, and restores the snapshot when
// a statement throws, as postgres would roll back.
const rollbackClient = (army: StoredArmy, attempted: string[]): Sql => {
  const begin = async (
    run: (tx: StatementTag) => Promise<boolean>,
  ): Promise<boolean> => {
    const snapshot = copyArmy(army);
    const tx: StatementTag = async (strings, ...values) => {
      const name = statementName(strings);
      attempted.push(name);
      // The last write fails, after the army was renamed and its unit rows
      // replaced.
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

// A write that renames the army and replaces both lists with catalog units and
// cards.
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

// The saved army before the edit: its own name, one unit row and one command
// card row.
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

describe('saveOwnedArmy function', () => {
  it(
    'leaves the army name and rows unchanged when a composition insert fails',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const army = originalArmy();
      // A snapshot to compare against after the failed save.
      const before = copyArmy(army);
      const attempted: string[] = [];
      const write = renamedWrite();

      await expect(
        saveOwnedArmy(rollbackClient(army, attempted), {
          userId: 'user-1',
          armyId,
          write,
        }),
        // The error is rethrown to the caller, so the player sees the save
        // fail.
      ).rejects.toThrow('command card insert failed');

      // Every statement up to the failing one ran, in the order the save writes
      // them.
      expect(attempted).toStrictEqual([
        'update armies',
        'delete army_unit_cards',
        'delete army_command_cards',
        'insert army_unit_cards',
        'insert army_command_cards',
      ]);
      // The rollback leaves the old name and rows intact: a failed save never
      // leaves a half-written army.
      expect(army).toStrictEqual(before);
    },
  );
});
