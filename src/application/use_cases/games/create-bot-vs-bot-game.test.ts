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

      // The creator owns a standard-mode-legal army for each side; owned-army storage is an in-memory stand-in.
      const { store, enginePorts } = liveGameStore({
        [blackArmyId]: standardArmy(blackArmyId),
        [whiteArmyId]: standardArmy(whiteArmyId),
      });

      // Standard mode is requested, so the stored game must carry that mode.
      const created = await createBotVsBotGame(store, 'auth0|human', {
        blackArmyId,
        gameMode: 'standard',
        whiteArmyId,
      });

      assert.ok(created.success);
      // Read the game back from engine storage: a returned id only counts if the game was saved.
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

      // Empty armies, which fail the mini mode's composition rules.
      const { store } = liveGameStore({
        [blackArmyId]: army(blackArmyId),
        [whiteArmyId]: army(whiteArmyId),
      });

      // The creator asked for mini with unfit armies: their mistake, so 400.
      const created = await createBotVsBotGame(store, 'auth0|human', {
        blackArmyId,
        gameMode: 'mini',
        whiteArmyId,
      });

      expect(created).toMatchObject({ status: 400, success: false });
    },
  );
});
