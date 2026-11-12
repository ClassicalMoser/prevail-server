import { streamKey } from './stream-key';

describe('streamKey function', () => {
  it(
    'joins the game id and round number this test set',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // The key is the game id and round, so each round of each game has its
      // own event stream.
      const key = streamKey('game-1', 3);

      expect(key).toBe('game-1:3');
    },
  );
});
