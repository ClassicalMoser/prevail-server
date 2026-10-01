import { projectEventForVisibility } from '@classicalmoser/prevail-rules/domain';
import type { Event } from '@classicalmoser/prevail-rules/domain';
import type { GameSessionStore } from './game-session-store';
import { sendToSeat } from './send-to-seat';

/**
 * Project one appended event to both seats.
 *
 * Each side sees only the visibility the rules allow. A player choice and a
 * game effect stay different outbound message types.
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
};

export { fanoutEvent };
