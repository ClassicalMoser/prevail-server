import type { CreateVsBotGameBody } from '@classicalmoser/prevail-contracts';
import type { DataErrorSignature, ErrorSignature } from '@ports';
import { randomUUID } from 'node:crypto';
import { BOT_PLAYER_ID } from '@application/composable/game-session/bot/bot-player-id';
import { takeBotTurns } from '@application/composable/game-session/bot/take-bot-turns';
import { armiesCompositionFailure } from '@application/composable/game-session/create/armies-composition-failure';
import { buildNewGame } from '@application/composable/game-session/create/build-new-game';
import { loadOwnedArmy } from '@application/composable/game-session/create/load-owned-army';
import { persistNewGame } from '@application/composable/game-session/create/persist-new-game';
import { enqueue } from '@application/composable/game-session/session/enqueue';
import type { GameSessionStore } from '@application/composable/game-session/session/game-session-store';

/**
 * Create a vs-bot game from two armies the subject owns.
 *
 * `body.gameMode` is mini or standard. Both armies must pass that mode's
 * composition rules before anything is saved.
 *
 * The human subject is kept in session meta for seat auth. Player fields on
 * the game are UUIDs because the client schema requires them and an Auth0
 * `sub` is not a UUID. The event stream is opened at the pre-round number
 * the engine appends with. Bot turns that are already expected run before
 * the game id is returned.
 *
 * @param store - Live-game memory.
 * @param subject - Auth subject of the creating player.
 * @param body - Sides and army ids from the create contract.
 * @returns The new game id, or an error envelope.
 */
const createVsBotGame = async (
  store: GameSessionStore,
  subject: string,
  body: CreateVsBotGameBody,
): Promise<DataErrorSignature<string>> => {
  // Both armies must already belong to the creating subject.
  // The create body names an army per side; split them into the human's and the
  // bot's, since the creator supplies both until rules builds a bot army.
  const humanArmyId =
    body.humanSide === 'white' ? body.whiteArmyId : body.blackArmyId;
  const botArmyId =
    body.humanSide === 'white' ? body.blackArmyId : body.whiteArmyId;

  // TODO(misleading): the two lookups word a missing army differently. The
  // human's is the storage's own failure (404 stays 404); the bot's becomes a
  // 400 "Bot army ...". bot-vs-bot answers 400 for both, naming the side.
  // The author decides which wording a client should see before they merge.
  const human = await loadOwnedArmy(
    store,
    subject,
    humanArmyId,
    (failure) => failure,
  );
  if (!human.success) {
    return human;
  }
  const bot = await loadOwnedArmy(
    store,
    subject,
    botArmyId,
    (failure): ErrorSignature => ({
      message: 'Bot army must be an army owned by the creating player',
      status: failure.status === 404 ? 400 : failure.status,
      success: false,
    }),
  );
  if (!bot.success) {
    return bot;
  }

  // The human's army goes on the side they chose; the bot's on the other.
  const whiteArmy = body.humanSide === 'white' ? human.data : bot.data;
  const blackArmy = body.humanSide === 'black' ? human.data : bot.data;
  const composition = armiesCompositionFailure(
    whiteArmy,
    blackArmy,
    body.gameMode,
  );
  if (composition !== undefined) {
    return composition;
  }

  // The bot's seat has a fixed player id; the human's is fresh, since their
  // Auth0 subject stays in session meta and is not a UUID.
  const humanPlayerId = randomUUID();
  const gameId = randomUUID();
  const game = buildNewGame({
    blackArmy,
    blackPlayerId: body.humanSide === 'black' ? humanPlayerId : BOT_PLAYER_ID,
    gameId,
    gameMode: body.gameMode,
    whiteArmy,
    whitePlayerId: body.humanSide === 'white' ? humanPlayerId : BOT_PLAYER_ID,
  });
  const failure = await persistNewGame(store, game);
  if (failure !== undefined) {
    return failure;
  }

  // Remember who may open each seat, then play any bot turns already expected.
  store.metaByGameId.set(gameId, {
    gameMode: body.gameMode,
    humanSide: body.humanSide,
    humanSubject: subject,
    kind: 'vsBot',
  });
  // Both sides choose a card first, so the bot may already owe one; play it now
  // so the game opens at the human's decision. Queued so a socket opening at
  // once waits for it.
  await enqueue(store, gameId, async () => {
    await takeBotTurns(store, gameId);
  });

  const created: DataErrorSignature<string> = { data: gameId, success: true };
  return created;
};

export { createVsBotGame };
