import type {
  Army,
  CommandCard,
  UnitType,
} from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature, OwnedArmyStorage } from '@ports';

const whiteArmyId = '550e8400-e29b-41d4-a716-446655440001';
const blackArmyId = '550e8400-e29b-41d4-a716-446655440002';

/** Empty composition. Enough for create and seat-auth cases. */
const army = (id: string): Army => ({
  commandCards: [],
  id,
  units: [],
});

const unitType = (overrides: Partial<UnitType> = {}): UnitType => ({
  cost: 10,
  id: '11111111-1111-4111-8111-111111111111',
  imageUrl: 'https://example.com/unit.png',
  limit: 8,
  morale: 2,
  name: 'Test Unit',
  stats: {
    attack: 1,
    flexibility: 1,
    range: 0,
    retreat: 1,
    reverse: 0,
    rout: 1,
    speed: 1,
  },
  traits: ['formation'],
  version: '1.0.0',
  ...overrides,
});

const commandCard = (
  initiative: 1 | 2 | 3 | 4,
  index: number,
): CommandCard => ({
  command: {
    modifiers: [],
    number: 1,
    restrictions: {
      inspirationRangeRestriction: 1,
      traitRestrictions: [],
      unitRestrictions: [],
    },
    size: 'units',
    type: 'movement',
  },
  id: `22222222-2222-4222-8222-2222222222${String(index).padStart(2, '0')}`,
  initiative,
  modifiers: ['attack'],
  name: `Card ${initiative}-${index}`,
  roundEffect: {
    modifiers: [{ type: 'attack', value: 1 }],
    restrictions: {
      inspirationRangeRestriction: 1,
      traitRestrictions: [],
      unitRestrictions: [],
    },
  },
  unitSupport: { count: 1, supportType: 'generic' },
  version: '1.0.0',
});

/**
 * Mini-mode-legal army.
 *
 * Setup and snapshot tests need reserved units and a full command-card set.
 * Create-only tests use {@link army}.
 */
const miniArmy = (id: string): Army => ({
  commandCards: ([1, 2, 3, 4] as const).flatMap((initiative) =>
    [0, 1].map((copy) => commandCard(initiative, initiative * 10 + copy)),
  ),
  id,
  units: [{ count: 4, unitType: unitType({ cost: 10, morale: 2 }) }],
});

/** In-memory owned-army port that returns the armies this test registered. */
const ownedArmyStorage = (armies: Record<string, Army>): OwnedArmyStorage => ({
  archiveOwnedArmy: async (): Promise<DataErrorSignature<void>> => ({
    data: undefined,
    success: true,
  }),
  createOwnedArmy: async (): Promise<DataErrorSignature<string>> => ({
    data: whiteArmyId,
    success: true,
  }),
  getOwnedArmies: async (): Promise<DataErrorSignature<Army[]>> => ({
    data: Object.values(armies),
    success: true,
  }),
  getOwnedArmyById: async (
    _sub: string,
    id: string,
  ): Promise<DataErrorSignature<Army>> => {
    const found = armies[id];
    if (found === undefined) {
      return { message: 'Not found', status: 404, success: false };
    }
    return { data: found, success: true };
  },
  updateOwnedArmy: async (): Promise<DataErrorSignature<void>> => ({
    data: undefined,
    success: true,
  }),
});

export { army, blackArmyId, miniArmy, ownedArmyStorage, whiteArmyId };
