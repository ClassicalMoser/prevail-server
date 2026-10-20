import type { CreateBotVsBotGameBody } from '@classicalmoser/prevail-contracts';
import { createInitialGameState } from '@classicalmoser/prevail-rules/domain';
import type { GameForVisibility } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports';
import { randomUUID } from 'node:crypto';
import { armiesCompositionFailure } from '@application/composable/game-session/session/armies-composition-failure';
import type { GameSessionStore } from '@application/composable/game-session/session/game-session-store';

/**
 * Owned-army lookup failure for one side of a bot-vs-bot create.
 *
 * A missing army is 400. Any other storage failure keeps its status.
 *
 * @param status - Status from the owned-army port.
 * @param sideLabel - Which seat the id was for.
 * @returns The envelope create should return.
 */
const ownedArmyFailure = (
  status: number,
  sideLabel: 'White' | 'Black',
): DataErrorSignature<GameForVisibility<'authoritative'>> => {
  if (status === 404) {
    const missing: DataErrorSignature<GameForVisibility<'authoritative'>> = {
      message: `${sideLabel} army must be an army owned by the creating player`,
      status: 400,
      success: false,
    };
    return missing;
  }
  const failure: DataErrorSignature<GameForVisibility<'authoritative'>> = {
    message: 'Army could not be loaded',
    status,
    success: false,
  };
  return failure;
};

/**
 * Create a bot-vs-bot game from two armies the subject owns.
 *
 * No choice is played. The returned game is the opening position. Both
 * armies must pass `body.gameMode` composition before the game is saved.
 * Session meta records the creator so later reads and steps can authorize.
 *
 * @param store - Live-game memory.
 * @param subject - Auth subject of the creating player.
 * @param body - Mode and army ids from the create contract.
 * @returns The authoritative opening game, or an error envelope.
 */
const createBotVsBotGame = async (
  store: GameSessionStore,
  subject: string,
  body: CreateBotVsBotGameBody,
): Promise<DataErrorSignature<GameForVisibility<'authoritative'>>> => {
  const whiteOwned = await store.ownedArmyStorage.getOwnedArmyById(
    subject,
    body.whiteArmyId,
  );
  if (!whiteOwned.success) {
    const failure = ownedArmyFailure(whiteOwned.status, 'White');
    return failure;
  }
  const blackOwned = await store.ownedArmyStorage.getOwnedArmyById(
    subject,
    body.blackArmyId,
  );
  if (!blackOwned.success) {
    const failure = ownedArmyFailure(blackOwned.status, 'Black');
    return failure;
  }

  const whiteArmy = whiteOwned.data;
  const blackArmy = blackOwned.data;
  const composition = armiesCompositionFailure(
    whiteArmy,
    blackArmy,
    body.gameMode,
  );
  if (composition !== undefined) {
    return composition;
  }

  const gameId = randomUUID();
  const whitePlayerId = randomUUID();
  const blackPlayerId = randomUUID();
  const gameState = createInitialGameState({
    blackArmy,
    gameMode: body.gameMode,
    whiteArmy,
  });
  const game: GameForVisibility<'authoritative'> = {
    blackArmy,
    blackPlayer: blackPlayerId,
    gameMode: body.gameMode,
    gameState,
    id: gameId,
    whiteArmy,
    whitePlayer: whitePlayerId,
  };

  const saveResult = await store.enginePorts.gameStorage.saveNewGame(game);
  if (!saveResult.result) {
    return {
      message: saveResult.errorReason,
      status: 500,
      success: false,
    };
  }

  const streamResult =
    await store.enginePorts.eventStreamStorage.newEventStream(
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

  store.metaByGameId.set(gameId, {
    creatorSubject: subject,
    gameMode: body.gameMode,
    kind: 'botVsBot',
    stuck: false,
  });

  return { data: game, success: true };
};

export { createBotVsBotGame };
