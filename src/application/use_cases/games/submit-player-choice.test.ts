import { gameSessionStore } from '@testing';
import { submitPlayerChoice } from './submit-player-choice';

describe('submitPlayerChoice function', () => {
  it('returns 404 when the game is not hosted here', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const store = gameSessionStore();
    const result = await submitPlayerChoice(store, {
      gameId: 'missing',
      playerChoice: {
        choiceType: 'doneIssuingCommands',
        eventNumber: 0,
        eventType: 'playerChoice',
        player: 'white',
      },
      side: 'white',
      subject: 'auth0|human',
    });

    expect(result).toStrictEqual({
      message: 'Game not found',
      status: 404,
      success: false,
    });
  });

  it('returns 403 when the subject does not own the seat', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const store = gameSessionStore();
    store.metaByGameId.set('game-1', {
      gameMode: 'mini',
      humanSide: 'white',
      humanSubject: 'auth0|human',
    });

    const result = await submitPlayerChoice(store, {
      gameId: 'game-1',
      playerChoice: {
        choiceType: 'doneIssuingCommands',
        eventNumber: 0,
        eventType: 'playerChoice',
        player: 'white',
      },
      side: 'white',
      subject: 'other',
    });

    expect(result).toStrictEqual({
      message: 'Seat not assigned to this player',
      status: 403,
      success: false,
    });
  });
});
