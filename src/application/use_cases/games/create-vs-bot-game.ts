import type { CreateVsBotGameBody } from '@classicalmoser/prevail-contracts';
import { createInitialGameState } from '@classicalmoser/prevail-rules/domain';
import type { GameForVisibility } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports';
import { randomUUID } from 'node:crypto';
import { BOT_PLAYER_ID } from '@application/composable/game-session/bot-player-id';
import { enqueue } from '@application/composable/game-session/enqueue';
import type { GameSessionStore } from '@application/composable/game-session/game-session-store';
import { takeBotTurns } from '@application/composable/game-session/take-bot-turns';
import { VS_BOT_GAME_MODE } from '@application/composable/game-session/vs-bot-game-mode';

/**
 * Create a mini vs-bot game from two armies the subject owns.
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
  const humanArmyId =
    body.humanSide === 'white' ? body.whiteArmyId : body.blackArmyId;
  const botArmyId =
    body.humanSide === 'white' ? body.blackArmyId : body.whiteArmyId;

  const humanArmy = await store.ownedArmyStorage.getOwnedArmyById(
    subject,
    humanArmyId,
  );
  if (!humanArmy.success) {
    return humanArmy;
  }

  const botArmy = await store.ownedArmyStorage.getOwnedArmyById(
    subject,
    botArmyId,
  );
  if (!botArmy.success) {
    return {
      message: 'Bot army must be an army owned by the creating player',
      status: botArmy.status === 404 ? 400 : botArmy.status,
      success: false,
    };
  }

  const whiteArmy = body.humanSide === 'white' ? humanArmy.data : botArmy.data;
  const blackArmy = body.humanSide === 'black' ? humanArmy.data : botArmy.data;

  // Auth0 subject stays in session meta. Game player fields must be UUIDs.
  const gameId = randomUUID();
  const humanPlayerId = randomUUID();
  const whitePlayerId =
    body.humanSide === 'white' ? humanPlayerId : BOT_PLAYER_ID;
  const blackPlayerId =
    body.humanSide === 'black' ? humanPlayerId : BOT_PLAYER_ID;
  const gameState = createInitialGameState({
    blackArmy,
    gameMode: VS_BOT_GAME_MODE,
    whiteArmy,
  });
  const game: GameForVisibility<'authoritative'> = {
    blackArmy,
    blackPlayer: blackPlayerId,
    gameMode: VS_BOT_GAME_MODE,
    gameState: gameState as GameForVisibility<'authoritative'>['gameState'],
    id: gameId,
    whiteArmy,
    whitePlayer: whitePlayerId,
  };

  // Persist the game before the stream. The engine appends setup events on
  // currentRoundNumber, which is 0 during pre-round setup.
  const saveResult = await store.enginePorts.gameStorage.saveNewGame(game);
  if (!saveResult.result) {
    return {
      message: saveResult.errorReason,
      status: 500,
      success: false,
    };
  }

  // processEvent appends with `gameState.currentRoundNumber` (0 during
  // pre-round setup), not `currentRoundState.roundNumber` (1).
  const streamResult = await store.enginePorts.eventStreamStorage.newEventStream(
    gameId,
    game.gameState.currentRoundNumber,
  );
  if (!streamResult.result) {
    return {
      message: streamResult.errorReason,
      status: 500,
      success: false,
    };
  }

  // Remember who may open each seat, then play any bot turns already expected.
  store.metaByGameId.set(gameId, {
    gameMode: VS_BOT_GAME_MODE,
    humanSide: body.humanSide,
    humanSubject: subject,
  });

  await enqueue(store, gameId, async () => {
    await takeBotTurns(store, gameId);
  });

  return { data: gameId, success: true };
};

export { createVsBotGame };
