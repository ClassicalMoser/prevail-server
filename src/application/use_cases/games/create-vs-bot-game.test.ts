import type { CreateVsBotGameBody } from '@classicalmoser/prevail-contracts';
import {
  getLegalPlayerChoiceOptions,
  PLAYER_CHOICE_EVENT_TYPE,
} from '@classicalmoser/prevail-rules/domain';
import assert from 'node:assert/strict';
import { createInMemoryEnginePorts } from '@infrastructure';
import { army, blackArmyId, miniArmy, ownedArmyStorage, whiteArmyId } from '@testing';
import { createGameSessionUseCases } from './game-session-use-cases';

describe('createVsBotGame function', () => {
  it(
    'creates a vs-bot game and assigns the human seat',
    { timeout: 5000 },
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
        botTurnGapMs: 0,
        enginePorts,
        ownedArmyStorage: ownedArmyStorage({
          [blackArmyId]: army(blackArmyId),
          [whiteArmyId]: army(whiteArmyId),
        }),
      });
      runtimeRef.current = runtime;

      const body: CreateVsBotGameBody = {
        blackArmyId,
        gameMode: 'mini',
        humanSide: 'white',
        whiteArmyId,
      };

      const result = await runtime.createVsBotGame('human-sub', body);
      expect(result).toMatchObject({ success: true, data: expect.any(String) });
      assert.ok(result.success);
      expect(runtime.getSeatSubject(result.data, 'white')).toBe('human-sub');
      expect(runtime.getSeatSubject(result.data, 'black')).toBe('bot:prevail');
    },
  );

  it(
    'initializes the event stream for currentRoundNumber so setup submits',
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

      const streamForProcessRound =
        await enginePorts.eventStreamStorage.getEventStream(created.data, 0);
      const wrongRoundStream =
        await enginePorts.eventStreamStorage.getEventStream(created.data, 1);
      expect({
        stream: streamForProcessRound,
        wrongRound: wrongRoundStream,
      }).toStrictEqual({
        stream: { data: expect.any(Array), result: true },
        wrongRound: { data: undefined, result: true },
      });

      const game = await enginePorts.gameStorage.getGame(created.data, 'mini');
      expect(game).toMatchObject({ result: true, data: expect.anything() });
      assert.ok(game !== undefined);
      assert.ok(game.result);

      const options = getLegalPlayerChoiceOptions(game.data.gameState);
      expect(options).toMatchObject({ choiceType: 'setupUnits' });
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
      const submitted = await runtime.submitPlayerChoice({
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

      expect(submitted).toStrictEqual({ data: undefined, success: true });
    },
  );
});
