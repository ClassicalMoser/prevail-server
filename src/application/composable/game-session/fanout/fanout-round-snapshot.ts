import { projectGameStateForVisibility } from '@classicalmoser/prevail-rules/domain';
import type { GameState } from '@classicalmoser/prevail-rules/domain';
import type { GameSessionStore } from '../session/game-session-store';
import { loadAuthoritativeGame } from '../session/load-authoritative-game';
import { sendToSeat } from './send-to-seat';
import { sendToWatchers } from './send-to-watchers';

/**
 * Push a seat-visible snapshot after a round is saved, and the
 * authoritative one to bot-vs-bot watchers.
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
  // A round saved for a game this process does not host has nobody to tell.
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
  // Each seat gets its own projection, so the opponent's chosen card stays hidden
  // in the round snapshot that reconciles a client's drift.
  for (const side of ['white', 'black'] as const) {
    const visibility = side === 'white' ? 'whiteSeen' : 'blackSeen';
    sendToSeat({
      gameId,
      message: {
        payload: projectGameStateForVisibility(
          authoritative.gameState,
          visibility,
        ),
        type: 'gameSnapshot',
      },
      side,
      store,
    });
  }
  // A watcher has no hand to hide, so it gets the authoritative state.
  sendToWatchers({
    gameId,
    message: { payload: authoritative.gameState, type: 'gameSnapshot' },
    store,
  });
};

export { fanoutRoundSnapshot };
