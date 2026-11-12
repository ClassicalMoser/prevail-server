import { army } from '@testing';
import { buildNewGame } from './build-new-game';

const input = {
  blackArmy: army('b'),
  blackPlayerId: 'black-player',
  gameId: 'game-1',
  gameMode: 'mini' as const,
  whiteArmy: army('w'),
  whitePlayerId: 'white-player',
};

describe('buildNewGame function', () => {
  it(
    'puts each army and player on the side it was given',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // The distinct ids and armies in `input` show each lands on its own side.
      const game = buildNewGame(input);

      expect(game).toMatchObject({
        blackArmy: input.blackArmy,
        blackPlayer: 'black-player',
        gameMode: 'mini',
        id: 'game-1',
        whiteArmy: input.whiteArmy,
        whitePlayer: 'white-player',
      });
    },
  );

  it('starts in setup, before any round is played', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // Round 0 is the setup round, before any command round begins.
    expect(buildNewGame(input).gameState.currentRoundState.roundNumber).toBe(0);
  });
});
