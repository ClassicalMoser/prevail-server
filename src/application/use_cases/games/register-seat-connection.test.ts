import { whiteInGameWsContract } from '@classicalmoser/prevail-contracts';
import {
  getLegalPlayerChoiceOptions,
  PLAYER_CHOICE_EVENT_TYPE,
} from '@classicalmoser/prevail-rules/domain';
import type { GameSessionOutbound } from '@ports';
import assert from 'node:assert/strict';
import { createInMemoryEnginePorts } from '@infrastructure';
import {
  army,
  blackArmyId,
  miniArmy,
  ownedArmyStorage,
  whiteArmyId,
} from '@testing';
import { createGameSessionUseCases } from './game-session-use-cases';

describe('registerSeatConnection function', () => {
  it(
    'rejects seat registration for the wrong subject',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const enginePorts = createInMemoryEnginePorts();
      const runtime = createGameSessionUseCases({
        botTurnGapMs: 0,
        enginePorts,
        ownedArmyStorage: ownedArmyStorage({
          [blackArmyId]: army(blackArmyId),
          [whiteArmyId]: army(whiteArmyId),
        }),
      });

      const created = await runtime.createVsBotGame('human-sub', {
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

      const registered = await runtime.registerSeatConnection({
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

      const enginePorts = createInMemoryEnginePorts();
      const runtime = createGameSessionUseCases({
        botTurnGapMs: 0,
        enginePorts,
        ownedArmyStorage: ownedArmyStorage({
          [blackArmyId]: miniArmy(blackArmyId),
          [whiteArmyId]: miniArmy(whiteArmyId),
        }),
      });

      const created = await runtime.createVsBotGame('auth0|human-sub', {
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
      const registered = await runtime.registerSeatConnection({
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
        blackPlayer: '00000000-0000-4000-8000-0000000000b0',
        gameState: {
          cardState: { visibility: 'whiteSeen' },
        },
        id: created.data,
        whitePlayer: expect.stringMatching(
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu,
        ),
      });
      expect([
        parsed.gameState.reservedUnits.length,
        parsed.gameState.cardState.white.inHand.length,
        parsed.gameState.cardState.black.inHand.length,
      ]).toStrictEqual([8, 8, 8]);
    },
  );

  it(
    'serializes reconnect bot resume with in-flight submits and opens with gameSnapshot',
    { timeout: 15_000 },
    async () => {
      expect.hasAssertions();

      const runtimeRef: {
        current?: ReturnType<typeof createGameSessionUseCases>;
      } = {};
      const enginePorts = createInMemoryEnginePorts({
        onEventAppended: (gameId, _round, event) => {
          runtimeRef.current?.fanoutEvent(gameId, event);
        },
        onRoundSnapshotSaved: (gameId, round, state) => {
          runtimeRef.current?.fanoutRoundSnapshot(gameId, round, state);
        },
      });
      const runtime = createGameSessionUseCases({
        botTurnGapMs: 25,
        enginePorts,
        ownedArmyStorage: ownedArmyStorage({
          [blackArmyId]: miniArmy(blackArmyId),
          [whiteArmyId]: miniArmy(whiteArmyId),
        }),
      });
      runtimeRef.current = runtime;

      const created = await runtime.createVsBotGame('auth0|human-sub', {
        blackArmyId,
        gameMode: 'mini',
        humanSide: 'white',
        whiteArmyId,
      });
      assert.ok(created.success);

      const game = await enginePorts.gameStorage.getGame(created.data, 'mini');
      assert.ok(game !== undefined);
      assert.ok(game.result);
      const options = getLegalPlayerChoiceOptions(game.data.gameState);
      assert.ok(options !== null);
      assert.ok(options.choiceType === 'setupUnits');

      const { setupUnits } = options;
      const unitPlacements = setupUnits.units.map((unit, index) => ({
        placement: {
          coordinate: setupUnits.coordinates[index]!,
          facing: 'south' as const,
        },
        unit,
      }));

      const messages: GameSessionOutbound[] = [];
      const submitPromise = runtime.submitPlayerChoice({
        gameId: created.data,
        playerChoice: {
          choiceType: 'setupUnits',
          commanderCoordinate: unitPlacements[0]!.placement.coordinate,
          eventNumber: options.expectedEventNumber,
          eventType: PLAYER_CHOICE_EVENT_TYPE,
          player: 'white',
          unitPlacements,
        },
        side: 'white',
        subject: 'auth0|human-sub',
      });

      const registerPromise = runtime.registerSeatConnection({
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
