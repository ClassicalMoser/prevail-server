import assert from 'node:assert/strict';
import { createInMemoryEnginePorts } from '@infrastructure';
import {
  army,
  blackArmyId,
  ownedArmyStorage,
  standardArmy,
  whiteArmyId,
} from '@testing';
import { createGameSessionUseCases } from './game-session-use-cases';

describe('createBotVsBotGame function', () => {
  it(
    'returns the opening game in the requested mode',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const runtime = createGameSessionUseCases({
        botTurnGapMs: 0,
        enginePorts: createInMemoryEnginePorts(),
        ownedArmyStorage: ownedArmyStorage({
          [blackArmyId]: standardArmy(blackArmyId),
          [whiteArmyId]: standardArmy(whiteArmyId),
        }),
      });

      const created = await runtime.createBotVsBotGame('auth0|human', {
        blackArmyId,
        gameMode: 'standard',
        whiteArmyId,
      });

      expect(created).toMatchObject({
        data: { gameMode: 'standard', id: expect.any(String) },
        success: true,
      });
      assert.ok(created.success);
      expect(created.data.gameState.winner).toBeUndefined();
    },
  );

  it(
    'rejects an army that fails the requested mode',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const runtime = createGameSessionUseCases({
        botTurnGapMs: 0,
        enginePorts: createInMemoryEnginePorts(),
        ownedArmyStorage: ownedArmyStorage({
          [blackArmyId]: army(blackArmyId),
          [whiteArmyId]: army(whiteArmyId),
        }),
      });

      const created = await runtime.createBotVsBotGame('auth0|human', {
        blackArmyId,
        gameMode: 'mini',
        whiteArmyId,
      });

      expect(created).toMatchObject({ status: 400, success: false });
    },
  );
});
