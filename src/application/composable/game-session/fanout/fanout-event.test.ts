import type { ChooseCardEvent } from '@classicalmoser/prevail-rules/domain';
import { tempCommandCards } from '@classicalmoser/prevail-rules/domain';
import type { GameSeatConnection, GameSessionOutbound } from '@ports';
import { gameSessionStore } from '@testing';
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
      const choice: ChooseCardEvent = {
        card: tempCommandCards[0],
        choiceType: 'chooseCard',
        eventNumber: 0,
        eventType: 'playerChoice',
        player: 'white',
      };

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
});
