import type { Event, Game } from '@classicalmoser/prevail-rules/domain';
import { createEmptyGameState } from '@classicalmoser/prevail-rules/domain';
import { createInMemoryEnginePorts } from './in-memory-engine-ports';

// An army with no units or command cards: the ports store games, and these
// cases never read the army.
const placeholderArmy = {
  commandCards: [],
  id: '550e8400-e29b-41d4-a716-446655440099',
  name: 'Test Army',
  units: [],
};

// A mini-mode game with an empty board state and a fixed id.
const sampleGame = (): Game => ({
  blackArmy: placeholderArmy,
  blackPlayer: 'black',
  gameMode: 'mini',
  gameState: createEmptyGameState('mini'),
  id: '550e8400-e29b-41d4-a716-446655440010',
  whiteArmy: placeholderArmy,
  whitePlayer: 'white',
});

describe('in-memory engine ports', () => {
  it('saves and loads a game by id and mode', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    // The ports hold games, event streams and round snapshots in memory, as a
    // live game does between database writes.
    const ports = createInMemoryEnginePorts();
    const game = sampleGame();

    const save = await ports.gameStorage.saveNewGame(game);
    expect(save.result).toBe(true);

    const loaded = await ports.gameStorage.getGame(game.id, 'mini');
    // Loading with the same id and mode returns the game that was saved.
    expect(loaded).toMatchObject({ result: true, data: { id: game.id } });
  });

  it(
    'notifies onEventAppended when an event is added',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The hook records what the server would broadcast to watchers when an
      // event is appended.
      const appended: Event[] = [];
      const ports = createInMemoryEnginePorts({
        onEventAppended: (_gameId, _round, event) => {
          appended.push(event);
        },
      });

      // The round-1 stream must exist before an event can be added.
      await ports.eventStreamStorage.newEventStream(sampleGame().id, 1);
      // A white player's choice not to retreat, one small event.
      const event: Event = {
        choiceType: 'chooseWhetherToRetreat',
        choosesToRetreat: false,
        eventType: 'playerChoice',
        player: 'white',
      };

      const result = await ports.eventStreamStorage.addEventToStream(
        sampleGame().id,
        1,
        event,
      );

      expect(result.result).toBe(true);
      // The hook received exactly the event that was stored.
      expect(appended).toStrictEqual([event]);
    },
  );

  it(
    'notifies onRoundSnapshotSaved when a snapshot is saved',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The hook records which round numbers got a snapshot.
      const saved: number[] = [];
      const ports = createInMemoryEnginePorts({
        onRoundSnapshotSaved: (_gameId, roundNumber) => {
          saved.push(roundNumber);
        },
      });

      // An empty mini-mode state is enough: only the round number matters here.
      const state = createEmptyGameState('mini');
      const result = await ports.roundSnapshotStorage.saveRoundSnapshot(
        sampleGame().id,
        1,
        state,
      );

      expect(result.result).toBe(true);
      // The hook saw round 1, the round the snapshot was saved for.
      expect(saved).toStrictEqual([1]);
    },
  );
});
