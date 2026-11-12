import type { ChooseCardEvent } from '@classicalmoser/prevail-rules/domain';
import type { GameSeatConnection, GameSessionOutbound } from '@ports';
import { gameSessionStore, tempCommandCards, watcher } from '@testing';
import { fanoutEvent } from './fanout-event';

const seat = (
  side: 'white' | 'black',
  messages: GameSessionOutbound[],
): GameSeatConnection => ({
  gameId: 'game-1',
  send: (message): void => {
    messages.push(message);
  },
  side,
  subject: side,
});

describe('fanoutEvent function', () => {
  it(
    'redacts opponent chooseCard card identity for the other seat',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // One recording socket per seat, so each side's received messages can be compared.
      const whiteMessages: GameSessionOutbound[] = [];
      const blackMessages: GameSessionOutbound[] = [];
      const store = gameSessionStore({
        connections: new Map([
          [
            'game-1',
            new Set([
              seat('white', whiteMessages),
              seat('black', blackMessages),
            ]),
          ],
        ]),
      });
      // White lays a card face-down; the opponent must not learn which.
      const choice: ChooseCardEvent = {
        card: tempCommandCards[0],
        choiceType: 'chooseCard',
        eventType: 'playerChoice',
        player: 'white',
      };

      // White's own socket sees the card; black's sees it hidden.
      fanoutEvent(store, 'game-1', choice);

      const whiteChoice = whiteMessages.find(
        (message) => message.type === 'playerChoice',
      );
      const blackChoice = blackMessages.find(
        (message) => message.type === 'playerChoice',
      );
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

  it(
    'sends a watcher the chooseCard event with its card',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // A single watcher and no seats in this game.
      const watching = watcher('game-1');
      const store = gameSessionStore({
        watchers: new Map([['game-1', new Set([watching.connection])]]),
      });
      // The same white card choice, but a watcher has no hand to protect.
      const choice: ChooseCardEvent = {
        card: tempCommandCards[0],
        choiceType: 'chooseCard',
        eventType: 'playerChoice',
        player: 'white',
      };

      fanoutEvent(store, 'game-1', choice);

      // A watcher is not a seat, so nothing is hidden from it.
      expect(watching.sent).toStrictEqual([
        { payload: choice, type: 'playerChoice' },
      ]);
    },
  );
});
