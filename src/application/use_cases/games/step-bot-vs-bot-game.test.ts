import assert from 'node:assert/strict';
import { createInMemoryEnginePorts } from '@infrastructure';
import { blackArmyId, miniArmy, ownedArmyStorage, whiteArmyId } from '@testing';
import { createGameSessionUseCases } from './game-session-use-cases';

describe('stepBotVsBotGame function', () => {
  it(
    'returns 404 when the game is not hosted here',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const runtime = createGameSessionUseCases({
        botTurnGapMs: 0,
        enginePorts: createInMemoryEnginePorts(),
        ownedArmyStorage: ownedArmyStorage({}),
      });

      const stepped = await runtime.stepBotVsBotGame('auth0|human', 'missing');

      expect(stepped).toStrictEqual({
        message: 'Game not found',
        status: 404,
        success: false,
      });
    },
  );

  it(
    'plays white setup, then black setup, as separate steps',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const runtime = createGameSessionUseCases({
        botTurnGapMs: 0,
        enginePorts: createInMemoryEnginePorts(),
        ownedArmyStorage: ownedArmyStorage({
          [blackArmyId]: miniArmy(blackArmyId),
          [whiteArmyId]: miniArmy(whiteArmyId),
        }),
      });
      const created = await runtime.createBotVsBotGame('auth0|human', {
        blackArmyId,
        gameMode: 'mini',
        whiteArmyId,
      });
      assert.ok(created.success);

      const whiteStep = await runtime.stepBotVsBotGame(
        'auth0|human',
        created.data.id,
      );
      const blackStep = await runtime.stepBotVsBotGame(
        'auth0|human',
        created.data.id,
      );

      expect(whiteStep).toMatchObject({
        data: {
          choice: { choiceType: 'setupUnits', player: 'white' },
          status: 'awaitingChoice',
        },
        success: true,
      });
      expect(blackStep).toMatchObject({
        data: {
          choice: { choiceType: 'setupUnits', player: 'black' },
          status: 'awaitingChoice',
        },
        success: true,
      });
    },
  );

  it(
    'returns gameOver with no choice when the game is already over',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const enginePorts = createInMemoryEnginePorts();
      const runtime = createGameSessionUseCases({
        botTurnGapMs: 0,
        enginePorts,
        ownedArmyStorage: ownedArmyStorage({
          [blackArmyId]: miniArmy(blackArmyId),
          [whiteArmyId]: miniArmy(whiteArmyId),
        }),
      });
      const created = await runtime.createBotVsBotGame('auth0|human', {
        blackArmyId,
        gameMode: 'mini',
        whiteArmyId,
      });
      assert.ok(created.success);
      const finished = {
        ...created.data.gameState,
        winner: 'white' as const,
      };
      await enginePorts.gameStorage.updateGameState(created.data.id, finished);

      const first = await runtime.stepBotVsBotGame(
        'auth0|human',
        created.data.id,
      );
      const second = await runtime.stepBotVsBotGame(
        'auth0|human',
        created.data.id,
      );

      expect(first).toMatchObject({
        data: { choice: null, status: 'gameOver' },
        success: true,
      });
      expect(second).toMatchObject({
        data: { choice: null, status: 'gameOver' },
        success: true,
      });
    },
  );
});
