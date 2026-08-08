import type { CreateVsBotGameBody } from '@classicalmoser/prevail-contracts';
import { whiteInGameWsContract } from '@classicalmoser/prevail-contracts';
import type {
  Army,
  CommandCard,
  UnitType,
} from '@classicalmoser/prevail-rules/domain';
import { createGameSessionUseCases } from '@application';
import { createInMemoryEnginePorts } from '@infrastructure';
import type {
  DataErrorSignature,
  GameSessionOutbound,
  OwnedArmyStorage,
} from '@ports';

const army = (id: string): Army => ({
  commandCards: [],
  id,
  units: [],
});

const unitType = (overrides: Partial<UnitType> = {}): UnitType => ({
  cost: 10,
  id: '11111111-1111-4111-8111-111111111111',
  imageUrl: null,
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

/** Mini-mode-legal army for wire schema assertions. */
const miniArmy = (id: string): Army => ({
  commandCards: ([1, 2, 3, 4] as const).flatMap((initiative) =>
    [0, 1].map((copy) => commandCard(initiative, initiative * 10 + copy)),
  ),
  id,
  units: [
    { count: 4, unitType: unitType({ cost: 10, morale: 2 }) },
  ],
});

const whiteArmyId = '550e8400-e29b-41d4-a716-446655440001';
const blackArmyId = '550e8400-e29b-41d4-a716-446655440002';

const ownedArmyStorage = (
  armies: Record<string, Army>,
): OwnedArmyStorage => ({
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

describe('createGameSessionUseCases vs-bot create', () => {
  it(
    'creates a vs-bot game and assigns the human seat',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const runtimeRef: {
        current?: ReturnType<typeof createGameSessionUseCases>;
      } = {};
      const enginePorts = createInMemoryEnginePorts({
        onEventAppended: (gameId, _round, event) => {
          runtimeRef.current?.fanoutEvent(gameId, event);
        },
        onRoundSnapshotSaved: (gameId, round, state) => {
          runtimeRef.current?.fanoutRoundSnapshot(gameId, round, state);
        },
      });

      const runtime = createGameSessionUseCases({
        enginePorts,
        ownedArmyStorage: ownedArmyStorage({
          [blackArmyId]: army(blackArmyId),
          [whiteArmyId]: army(whiteArmyId),
        }),
      });
      runtimeRef.current = runtime;

      const body: CreateVsBotGameBody = {
        blackArmyId,
        gameMode: 'mini',
        humanSide: 'white',
        whiteArmyId,
      };

      const result = await runtime.createVsBotGame('human-sub', body);
      expect(result.success).toBe(true);
      expect(result.success && result.data).toBeTypeOf('string');
      expect(runtime.getSeatSubject(
        result.success ? result.data : '',
        'white',
      )).toBe('human-sub');
      expect(runtime.getSeatSubject(
        result.success ? result.data : '',
        'black',
      )).toBe('bot:prevail');
    },
  );

  it(
    'rejects seat registration for the wrong subject',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const enginePorts = createInMemoryEnginePorts();
      const runtime = createGameSessionUseCases({
        enginePorts,
        ownedArmyStorage: ownedArmyStorage({
          [blackArmyId]: army(blackArmyId),
          [whiteArmyId]: army(whiteArmyId),
        }),
      });

      const created = await runtime.createVsBotGame('human-sub', {
        blackArmyId,
        gameMode: 'mini',
        humanSide: 'white',
        whiteArmyId,
      });
      expect(created.success).toBe(true);

      const registered = await runtime.registerSeatConnection({
        gameId: created.success ? created.data : '',
        send: () => {
          /* Unused */
        },
        side: 'white',
        subject: 'other-sub',
      });

      expect(registered.success).toBe(false);
      expect(registered.success === false && registered.status).toBe(403);
    },
  );

  it(
    'sends a seat-visible roundSnapshot when a seat connects',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const enginePorts = createInMemoryEnginePorts();
      const runtime = createGameSessionUseCases({
        enginePorts,
        ownedArmyStorage: ownedArmyStorage({
          [blackArmyId]: miniArmy(blackArmyId),
          [whiteArmyId]: miniArmy(whiteArmyId),
        }),
      });

      const created = await runtime.createVsBotGame('auth0|human-sub', {
        blackArmyId,
        gameMode: 'mini',
        humanSide: 'white',
        whiteArmyId,
      });
      expect(created.success).toBe(true);

      const messages: GameSessionOutbound[] = [];
      const registered = await runtime.registerSeatConnection({
        gameId: created.success ? created.data : '',
        send: (message) => {
          messages.push(message);
        },
        side: 'white',
        subject: 'auth0|human-sub',
      });

      expect(registered.success).toBe(true);
      expect(messages).toHaveLength(1);
      expect(messages[0]?.type).toBe('roundSnapshot');

      // Client parses the JSON wire form with the seat contract schema; a
      // structural toMatchObject alone can green-light an unloadable payload.
      const wire = JSON.parse(JSON.stringify(messages[0]?.payload)) as unknown;
      const parsed =
        whiteInGameWsContract.validators.outbound.roundSnapshot.safeParse(wire);
      if (!parsed.success) {
        expect(parsed.error.issues).toStrictEqual([]);
      }
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.id).toBe(created.success ? created.data : '');
        expect(parsed.data.gameState.cardState.visibility).toBe('whiteSeen');
        expect(parsed.data.whitePlayer).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu,
        );
        expect(parsed.data.blackPlayer).toBe(
          '00000000-0000-4000-8000-0000000000b0',
        );
      }
    },
  );
});
