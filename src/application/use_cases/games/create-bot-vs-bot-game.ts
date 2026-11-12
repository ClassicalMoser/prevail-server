import type { CreateBotVsBotGameBody } from '@classicalmoser/prevail-contracts';
import type { DataErrorSignature } from '@ports';
import { randomUUID } from 'node:crypto';
import { armiesCompositionFailure } from '@application/composable/game-session/create/armies-composition-failure';
import { buildNewGame } from '@application/composable/game-session/create/build-new-game';
import { loadOwnedArmy } from '@application/composable/game-session/create/load-owned-army';
import { persistNewGame } from '@application/composable/game-session/create/persist-new-game';
import { unownedSideFailure } from '@application/composable/game-session/create/unowned-side-failure';
import type { GameSessionStore } from '@application/composable/game-session/session/game-session-store';

/**
 * Create a bot-vs-bot game from two armies the subject owns.
 *
 * No choice is played. The creator watches and steps the game over the
 * bot-vs-bot socket, which opens with the authoritative snapshot. Both
 * armies must pass `body.gameMode` composition before the game is saved.
 * Session meta records the creator so the socket can authorize.
 *
 * @param store - Live-game memory.
 * @param subject - Auth subject of the creating player.
 * @param body - Mode and army ids from the create contract.
 * @returns The new game id, or an error envelope.
 */
const createBotVsBotGame = async (
  store: GameSessionStore,
  subject: string,
  body: CreateBotVsBotGameBody,
): Promise<DataErrorSignature<string>> => {
  // Both armies must already belong to the creating subject.
  // The creator supplies both armies until rules builds a bot army.
  const white = await loadOwnedArmy(store, subject, body.whiteArmyId, (f) =>
    unownedSideFailure(f, 'White'),
  );
  if (!white.success) {
    return white;
  }
  const black = await loadOwnedArmy(store, subject, body.blackArmyId, (f) =>
    unownedSideFailure(f, 'Black'),
  );
  if (!black.success) {
    return black;
  }

  // An illegal list is refused before anything is saved.
  const composition = armiesCompositionFailure(
    white.data,
    black.data,
    body.gameMode,
  );
  if (composition !== undefined) {
    return composition;
  }

  // Neither seat has a human, so both sides get fresh player ids.
  const gameId = randomUUID();
  const game = buildNewGame({
    blackArmy: black.data,
    blackPlayerId: randomUUID(),
    gameId,
    gameMode: body.gameMode,
    whiteArmy: white.data,
    whitePlayerId: randomUUID(),
  });
  const failure = await persistNewGame(store, game);
  if (failure !== undefined) {
    return failure;
  }

  // Only the creator may open the watcher socket. `stuck` starts clear.
  store.metaByGameId.set(gameId, {
    creatorSubject: subject,
    gameMode: body.gameMode,
    kind: 'botVsBot',
    stuck: false,
  });

  const created: DataErrorSignature<string> = { data: gameId, success: true };
  return created;
};

export { createBotVsBotGame };
