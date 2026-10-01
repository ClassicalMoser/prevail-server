import { projectGameForVisibility } from '@classicalmoser/prevail-rules/domain';
import type { GameState } from '@classicalmoser/prevail-rules/domain';
import type { GameSessionStore } from './game-session-store';
import { loadAuthoritativeGame } from './load-authoritative-game';
import { sendToSeat } from './send-to-seat';

/**
 * Push a seat-visible snapshot after a round is saved.
 *
 * The round number and state arguments are the engine hook's signature.
 * The snapshot is loaded again so both seats see the stored game, not the
 * hook's state value.
 *
 * @param store - Live-game memory.
 * @param gameId - Game whose round was snapshotted.
 */
const fanoutRoundSnapshot = async (input: {
  store: GameSessionStore;
  gameId: string;
  roundNumber: number;
  gameState: GameState;
}): Promise<void> => {
  const { store, gameId } = input;
  const meta = store.metaByGameId.get(gameId);
  if (meta === undefined) {
    return;
  }
  const authoritative = await loadAuthoritativeGame(
    store,
    gameId,
    meta.gameMode,
  );
  if (authoritative === undefined) {
    return;
  }
  for (const side of ['white', 'black'] as const) {
    const visibility = side === 'white' ? 'whiteSeen' : 'blackSeen';
    sendToSeat({
      gameId,
      message: {
        payload: projectGameForVisibility(authoritative, visibility),
        type: 'gameSnapshot',
      },
      side,
      store,
    });
  }
};

export { fanoutRoundSnapshot };
