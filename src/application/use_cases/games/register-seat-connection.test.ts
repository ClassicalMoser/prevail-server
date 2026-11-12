import { whiteInGameWsContract } from '@classicalmoser/prevail-contracts';
import {
  gameSchema,
  getLegalPlayerChoiceOptions,
  PLAYER_CHOICE_EVENT_TYPE,
} from '@classicalmoser/prevail-rules/domain';
import type { GameSessionOutbound } from '@ports';
import assert from 'node:assert/strict';
import { blackArmyId, miniArmy, liveGameStore, whiteArmyId } from '@testing';
import { createVsBotGame } from './create-vs-bot-game';
import { submitPlayerChoice } from './submit-player-choice';
import { registerSeatConnection } from './register-seat-connection';

describe('registerSeatConnection function', () => {
  it(
    'rejects seat registration for the wrong subject',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const { store } = liveGameStore({
        [blackArmyId]: miniArmy(blackArmyId),
        [whiteArmyId]: miniArmy(whiteArmyId),
      });

      const created = await createVsBotGame(store, 'human-sub', {
        blackArmyId,
        gameMode: 'mini',
        humanSide: 'white',
        whiteArmyId,
      });
      expect(created).toMatchObject({
        success: true,
        data: expect.any(String),
      });
      assert.ok(created.success);

      const registered = await registerSeatConnection(store, {
        gameId: created.data,
        send: () => {
          /* Unused */
        },
        side: 'white',
        subject: 'other-sub',
      });

      expect(registered).toMatchObject({
        message: expect.any(String),
        status: 403,
        success: false,
      });
    },
  );

  it(
    'sends a seat-visible gameSnapshot when a seat connects',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const { store } = liveGameStore({
        [blackArmyId]: miniArmy(blackArmyId),
        [whiteArmyId]: miniArmy(whiteArmyId),
      });

      const created = await createVsBotGame(store, 'auth0|human-sub', {
        blackArmyId,
        gameMode: 'mini',
        humanSide: 'white',
        whiteArmyId,
      });
      expect(created).toMatchObject({
        success: true,
        data: expect.any(String),
      });
      assert.ok(created.success);

      const messages: GameSessionOutbound[] = [];
      const registered = await registerSeatConnection(store, {
        gameId: created.data,
        send: (message) => {
          messages.push(message);
        },
        side: 'white',
        subject: 'auth0|human-sub',
      });

      expect(registered.success).toBe(true);
      expect(messages).toStrictEqual([
        expect.objectContaining({ type: 'gameSnapshot' }),
      ]);

      // Client parses the JSON wire form with the seat contract schema.
      const parsed =
        whiteInGameWsContract.validators.outbound.gameSnapshot.parse(
          structuredClone(messages[0]?.payload),
        );
      expect(parsed).toMatchObject({
        cardState: { visibility: 'whiteSeen' },
        visibility: 'whiteSeen',
      });
      expect([
        parsed.reservedUnits.length,
        parsed.cardState.white.inHand.length,
        parsed.cardState.black.inHand.length,
      ]).toStrictEqual([8, 8, 8]);
    },
  );

  it(
    'serializes reconnect bot resume with in-flight submits and opens with gameSnapshot',
    { timeout: 15_000 },
    async () => {
      expect.hasAssertions();

      const { store, enginePorts } = liveGameStore(
        {
          [blackArmyId]: miniArmy(blackArmyId),
          [whiteArmyId]: miniArmy(whiteArmyId),
        },
        { botTurnGapMs: 25 },
      );

      const created = await createVsBotGame(store, 'auth0|human-sub', {
        blackArmyId,
        gameMode: 'mini',
        humanSide: 'white',
        whiteArmyId,
      });
      assert.ok(created.success);

      const game = await enginePorts.gameStorage.getGame(created.data, 'mini');
      assert.ok(game !== undefined);
      assert.ok(game.result);
      const options = getLegalPlayerChoiceOptions(
        gameSchema.parse(game.data).gameState,
      );
      assert.ok(options !== null);
      assert.ok(options.choiceType === 'setupUnits');

      const { setupUnits } = options;
      const unitPlacements = setupUnits.units.map((unit, index) => {
        const coordinate = setupUnits.coordinates[index];
        assert.ok(coordinate !== undefined);
        const placement = {
          placement: {
            coordinate,
            facing: 'south' as const,
          },
          unit,
        };
        return placement;
      });
      const firstPlacement = unitPlacements[0];
      assert.ok(firstPlacement !== undefined);

      const messages: GameSessionOutbound[] = [];
      const submitPromise = submitPlayerChoice(store, {
        gameId: created.data,
        playerChoice: {
          choiceType: 'setupUnits',
          commanderCoordinate: firstPlacement.placement.coordinate,
          eventType: PLAYER_CHOICE_EVENT_TYPE,
          player: 'white',
          unitPlacements,
        },
        side: 'white',
        subject: 'auth0|human-sub',
      });

      const registerPromise = registerSeatConnection(store, {
        gameId: created.data,
        send: (message) => {
          messages.push(message);
        },
        side: 'white',
        subject: 'auth0|human-sub',
      });

      const [submitted, registered] = await Promise.all([
        submitPromise,
        registerPromise,
      ]);

      expect(submitted).toStrictEqual({ data: undefined, success: true });
      expect(registered).toStrictEqual({ data: undefined, success: true });
      expect(messages[0]).toMatchObject({ type: 'gameSnapshot' });
    },
  );
});
