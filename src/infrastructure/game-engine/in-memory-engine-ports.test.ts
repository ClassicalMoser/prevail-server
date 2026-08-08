import type {
  Event,
  GameForVisibility,
} from '@classicalmoser/prevail-rules/domain';
import { createEmptyGameState } from '@classicalmoser/prevail-rules/domain';
import { createInMemoryEnginePorts } from './in-memory-engine-ports';

const placeholderArmy = {
  commandCards: [],
  id: '550e8400-e29b-41d4-a716-446655440099',
  units: [],
};

const sampleGame = (): GameForVisibility<'authoritative'> => ({
  blackArmy: placeholderArmy,
  blackPlayer: 'black',
  gameMode: 'mini',
  gameState: createEmptyGameState(
    'mini',
  ) as GameForVisibility<'authoritative'>['gameState'],
  id: '550e8400-e29b-41d4-a716-446655440010',
  whiteArmy: placeholderArmy,
  whitePlayer: 'white',
});

describe('in-memory engine ports', () => {
  it(
    'saves and loads a game by id and mode',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const ports = createInMemoryEnginePorts();
      const game = sampleGame();

      const save = await ports.gameStorage.saveNewGame(game);
      expect(save.result).toBe(true);

      const loaded = await ports.gameStorage.getGame(game.id, 'mini');
      expect(loaded?.result).toBe(true);
      expect(loaded?.result === true && loaded.data.id).toBe(game.id);
    },
  );

  it(
    'notifies onEventAppended when an event is added',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const appended: Event[] = [];
      const ports = createInMemoryEnginePorts({
        onEventAppended: (_gameId, _round, event) => {
          appended.push(event);
        },
      });

      await ports.eventStreamStorage.newEventStream(sampleGame().id, 1);
      const event: Event = {
        choiceType: 'chooseWhetherToRetreat',
        choosesToRetreat: false,
        eventNumber: 0,
        eventType: 'playerChoice',
        player: 'white',
      };

      const result = await ports.eventStreamStorage.addEventToStream(
        sampleGame().id,
        1,
        event,
      );

      expect(result.result).toBe(true);
      expect(appended).toStrictEqual([event]);
    },
  );

  it(
    'notifies onRoundSnapshotSaved when a snapshot is saved',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const saved: number[] = [];
      const ports = createInMemoryEnginePorts({
        onRoundSnapshotSaved: (_gameId, roundNumber) => {
          saved.push(roundNumber);
        },
      });

      const state = createEmptyGameState('mini');
      const result = await ports.roundSnapshotStorage.saveRoundSnapshot(
        sampleGame().id,
        1,
        state,
      );

      expect(result.result).toBe(true);
      expect(saved).toStrictEqual([1]);
    },
  );
});
