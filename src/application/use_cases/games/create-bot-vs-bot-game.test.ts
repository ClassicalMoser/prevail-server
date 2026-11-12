import assert from 'node:assert/strict';
import {
  army,
  blackArmyId,
  liveGameStore,
  standardArmy,
  whiteArmyId,
} from '@testing';
import { createBotVsBotGame } from './create-bot-vs-bot-game';

describe('createBotVsBotGame function', () => {
  it(
    'returns the id of a game saved in the requested mode',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const { store, enginePorts } = liveGameStore({
        [blackArmyId]: standardArmy(blackArmyId),
        [whiteArmyId]: standardArmy(whiteArmyId),
      });

      const created = await createBotVsBotGame(store, 'auth0|human', {
        blackArmyId,
        gameMode: 'standard',
        whiteArmyId,
      });

      assert.ok(created.success);
      const saved = await enginePorts.gameStorage.getGame(
        created.data,
        'standard',
      );

      expect(saved).toMatchObject({
        data: { gameMode: 'standard', id: created.data },
        result: true,
      });
    },
  );

  it(
    'rejects an army that fails the requested mode',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const { store } = liveGameStore({
        [blackArmyId]: army(blackArmyId),
        [whiteArmyId]: army(whiteArmyId),
      });

      const created = await createBotVsBotGame(store, 'auth0|human', {
        blackArmyId,
        gameMode: 'mini',
        whiteArmyId,
      });

      expect(created).toMatchObject({ status: 400, success: false });
    },
  );
});
