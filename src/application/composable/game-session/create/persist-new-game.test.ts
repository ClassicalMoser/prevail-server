import { gameSessionStore, miniArmy } from '@testing';
import { buildNewGame } from './build-new-game';
import { persistNewGame } from './persist-new-game';

const game = buildNewGame({
  blackArmy: miniArmy('b'),
  blackPlayerId: 'black-player',
  gameId: 'game-1',
  gameMode: 'mini',
  whiteArmy: miniArmy('w'),
  whitePlayerId: 'white-player',
});

/** A store whose engine writes succeed, except the one the test names. */
const storeWhere = (fails: {
  save?: string;
  stream?: string;
}): ReturnType<typeof gameSessionStore> => {
  const store = gameSessionStore();
  vi.mocked(store.enginePorts.gameStorage.saveNewGame).mockResolvedValue(
    fails.save === undefined
      ? { data: undefined, result: true }
      : { errorReason: fails.save, result: false },
  );
  vi.mocked(
    store.enginePorts.eventStreamStorage.newEventStream,
  ).mockResolvedValue(
    fails.stream === undefined
      ? { data: [], result: true }
      : { errorReason: fails.stream, result: false },
  );
  return store;
};

describe('persistNewGame function', () => {
  it(
    'saves the game and opens its round 0 stream',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const store = storeWhere({});

      await expect(persistNewGame(store, game)).resolves.toBeUndefined();
      expect(
        store.enginePorts.eventStreamStorage.newEventStream,
      ).toHaveBeenCalledWith('game-1', 0);
    },
  );

  it(
    'answers 500 and opens no stream when the save fails',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const store = storeWhere({ save: 'disk full' });

      await expect(persistNewGame(store, game)).resolves.toStrictEqual({
        message: 'disk full',
        status: 500,
        success: false,
      });
      expect(
        store.enginePorts.eventStreamStorage.newEventStream,
      ).not.toHaveBeenCalled();
    },
  );

  it(
    'answers 500 when the stream cannot be opened',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const store = storeWhere({ stream: 'no stream' });

      await expect(persistNewGame(store, game)).resolves.toStrictEqual({
        message: 'no stream',
        status: 500,
        success: false,
      });
    },
  );
});
