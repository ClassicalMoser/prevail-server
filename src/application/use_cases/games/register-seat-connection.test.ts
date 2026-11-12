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

      // Mini-legal armies for both sides, so a vs-bot game can be created.
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

      // A different subject tries to sit in the human's seat.
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

      // Mini-legal armies for both sides, so a vs-bot game can be created.
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

      // Record what the human's socket receives on connecting.
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
      // Connecting sends exactly one message, the seat's own snapshot, before anything else.
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

      // A 25 ms bot gap makes the bot's reply slow enough to overlap with the reconnect below.
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

      // Read the stored opening so the setup placement below is built from the rules' own offer.
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
      // The human's setup submit is started but not awaited, so it is still in flight when the socket connects.
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

      // The same seat connects while that submit (and the bot reply it triggers) is running.
      const registerPromise = registerSeatConnection(store, {
        gameId: created.data,
        send: (message) => {
          messages.push(message);
        },
        side: 'white',
        subject: 'auth0|human-sub',
      });

      // Both finish; the connection is queued with the submit, so neither is lost.
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
