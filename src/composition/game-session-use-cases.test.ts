import type { CreateVsBotGameBody } from '@classicalmoser/prevail-contracts';
import type { Army } from '@classicalmoser/prevail-rules/domain';
import { createGameSessionUseCases } from '@application';
import { createInMemoryEnginePorts } from '@infrastructure';
import type { DataErrorSignature, OwnedArmyStorage } from '@ports';

const army = (id: string): Army => ({
  commandCards: [],
  id,
  units: [],
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

      const registered = runtime.registerSeatConnection({
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
});
