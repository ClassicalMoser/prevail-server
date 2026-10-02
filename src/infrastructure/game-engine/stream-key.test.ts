import { streamKey } from './stream-key';

describe('streamKey function', () => {
  it(
    'joins the game id and round number this test set',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const key = streamKey('game-1', 3);

      expect(key).toBe('game-1:3');
    },
  );
});
