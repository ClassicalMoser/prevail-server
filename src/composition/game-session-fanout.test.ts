import type { CreateVsBotGameBody } from '@classicalmoser/prevail-contracts';
import type { Army, ChooseCardEvent } from '@classicalmoser/prevail-rules/domain';
import { tempCommandCards } from '@classicalmoser/prevail-rules/domain';
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

const whiteArmyId = '550e8400-e29b-41d4-a716-446655440001';
const blackArmyId = '550e8400-e29b-41d4-a716-446655440002';

const ownedArmyStorage = (): OwnedArmyStorage => ({
  archiveOwnedArmy: async (): Promise<DataErrorSignature<void>> => ({
    data: undefined,
    success: true,
  }),
  createOwnedArmy: async (): Promise<DataErrorSignature<string>> => ({
    data: whiteArmyId,
    success: true,
  }),
  getOwnedArmies: async (): Promise<DataErrorSignature<Army[]>> => ({
    data: [army(whiteArmyId), army(blackArmyId)],
    success: true,
  }),
  getOwnedArmyById: async (
    _sub: string,
    id: string,
  ): Promise<DataErrorSignature<Army>> => {
    if (id === whiteArmyId || id === blackArmyId) {
      return { data: army(id), success: true };
    }
    return { message: 'Not found', status: 404, success: false };
  },
  updateOwnedArmy: async (): Promise<DataErrorSignature<void>> => ({
    data: undefined,
    success: true,
  }),
});

describe('game session event fanout', () => {
  it(
    'redacts opponent chooseCard card identity for the other seat',
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
      });

      const runtime = createGameSessionUseCases({
        enginePorts,
        ownedArmyStorage: ownedArmyStorage(),
      });
      runtimeRef.current = runtime;

      const body: CreateVsBotGameBody = {
        blackArmyId,
        gameMode: 'mini',
        humanSide: 'white',
        whiteArmyId,
      };
      const created = await runtime.createVsBotGame('human-sub', body);
      expect(created.success).toBe(true);
      const gameId = created.success ? created.data : '';

      const whiteMessages: GameSessionOutbound[] = [];
      const blackMessages: GameSessionOutbound[] = [];

      expect(
        runtime.registerSeatConnection({
          gameId,
          send: (message) => {
            whiteMessages.push(message);
          },
          side: 'white',
          subject: 'human-sub',
        }).success,
      ).toBe(true);

      expect(
        runtime.registerSeatConnection({
          gameId,
          send: (message) => {
            blackMessages.push(message);
          },
          side: 'black',
          subject: 'bot:prevail',
        }).success,
      ).toBe(true);

      const choice: ChooseCardEvent = {
        card: tempCommandCards[0],
        choiceType: 'chooseCard',
        eventNumber: 0,
        eventType: 'playerChoice',
        player: 'white',
      };
      runtime.fanoutEvent(gameId, choice);

      const whiteChoice = whiteMessages.find((m) => m.type === 'playerChoice');
      const blackChoice = blackMessages.find((m) => m.type === 'playerChoice');

      expect(whiteChoice?.payload).toMatchObject({
        card: tempCommandCards[0],
        player: 'white',
      });
      expect(blackChoice?.payload).toMatchObject({
        card: 'hidden',
        player: 'white',
      });
    },
  );
});
