import assert from 'node:assert/strict';
import { createInMemoryEnginePorts } from '@infrastructure';
import { blackArmyId, miniArmy, ownedArmyStorage, whiteArmyId } from '@testing';
import { createGameSessionUseCases } from './game-session-use-cases';

describe('getBotVsBotGame function', () => {
  it('returns 404 for a human-vs-bot game', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const runtime = createGameSessionUseCases({
      botTurnGapMs: 0,
      enginePorts: createInMemoryEnginePorts(),
      ownedArmyStorage: ownedArmyStorage({
        [blackArmyId]: miniArmy(blackArmyId),
        [whiteArmyId]: miniArmy(whiteArmyId),
      }),
    });
    const created = await runtime.createVsBotGame('auth0|human', {
      blackArmyId,
      gameMode: 'mini',
      humanSide: 'white',
      whiteArmyId,
    });
    assert.ok(created.success);

    const loaded = await runtime.getBotVsBotGame('auth0|human', created.data);

    expect(loaded).toStrictEqual({
      message: 'Game not found',
      status: 404,
      success: false,
    });
  });

  it(
    'returns 403 when the subject did not create the game',
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

      const loaded = await runtime.getBotVsBotGame(
        'auth0|other',
        created.data.id,
      );

      expect(loaded).toMatchObject({ status: 403, success: false });
    },
  );
});
