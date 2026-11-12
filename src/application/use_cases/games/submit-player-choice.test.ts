import { gameSessionStore } from '@testing';
import { submitPlayerChoice } from './submit-player-choice';

describe('submitPlayerChoice function', () => {
  it(
    'returns 404 when the game is not hosted here',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // An empty store hosts no game, so the submit has nowhere to go.
      const store = gameSessionStore();
      const result = await submitPlayerChoice(store, {
        gameId: 'missing',
        playerChoice: {
          choiceType: 'doneIssuingCommands',
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
    },
  );

  it(
    'returns 403 when the subject does not own the seat',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // A human-vs-bot game owned by `auth0|human`.
      const store = gameSessionStore();
      store.metaByGameId.set('game-1', {
        gameMode: 'mini',
        humanSide: 'white',
        humanSubject: 'auth0|human',
        kind: 'vsBot',
      });

      // A different subject sends a choice for white's seat; only the seat's owner may submit for it.
      const result = await submitPlayerChoice(store, {
        gameId: 'game-1',
        playerChoice: {
          choiceType: 'doneIssuingCommands',
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
    },
  );
});
