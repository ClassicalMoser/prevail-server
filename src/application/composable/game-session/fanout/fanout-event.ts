import { projectEventForVisibility } from '@classicalmoser/prevail-rules/domain';
import type { Event } from '@classicalmoser/prevail-rules/domain';
import type { GameSessionStore } from '../session/game-session-store';
import { sendToSeat } from './send-to-seat';
import { sendToWatchers } from './send-to-watchers';

/**
 * Project one appended event to both seats, and send it whole to watchers.
 *
 * Each side sees only the visibility the rules allow. A bot-vs-bot watcher
 * has no seat and sees the authoritative event. A player choice and a game
 * effect stay different outbound message types.
 *
 * @param store - Live-game memory.
 * @param gameId - Game the event was appended to.
 * @param event - Authoritative event from the engine.
 */
const fanoutEvent = (
  store: GameSessionStore,
  gameId: string,
  event: Event,
): void => {
  // Projection is where hidden information is removed: each seat's copy of the
  // event reads the opponent's chosen card as hidden.
  for (const side of ['white', 'black'] as const) {
    const projected = projectEventForVisibility(event, side);
    if (projected.eventType === 'playerChoice') {
      sendToSeat({
        gameId,
        message: {
          payload: projected,
          type: 'playerChoice',
        },
        side,
        store,
      });
    } else {
      sendToSeat({
        gameId,
        message: {
          payload: projected,
          type: 'gameEffect',
        },
        side,
        store,
      });
    }
  }
  // Watchers follow the same stream as a seat, unprojected.
  if (event.eventType === 'playerChoice') {
    sendToWatchers({
      gameId,
      message: { payload: event, type: 'playerChoice' },
      store,
    });
  } else {
    sendToWatchers({
      gameId,
      message: { payload: event, type: 'gameEffect' },
      store,
    });
  }
};

export { fanoutEvent };
