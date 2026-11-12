import { gameNotFound } from './game-not-found';

describe('gameNotFound function', () => {
  it('is a 404 that says the game was not found', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(gameNotFound()).toStrictEqual({
      message: 'Game not found',
      status: 404,
      success: false,
    });
  });
});
