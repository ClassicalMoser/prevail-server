import type { CreateVsBotGameBody } from '@classicalmoser/prevail-contracts';
import {
  gameSchema,
  getLegalPlayerChoiceOptions,
  PLAYER_CHOICE_EVENT_TYPE,
} from '@classicalmoser/prevail-rules/domain';
import assert from 'node:assert/strict';
import {
  army,
  blackArmyId,
  miniArmy,
  liveGameStore,
  standardArmy,
  whiteArmyId,
} from '@testing';
import { createVsBotGame } from './create-vs-bot-game';
import { getSeatSubject } from './get-seat-subject';
import { submitPlayerChoice } from './submit-player-choice';

describe('createVsBotGame function', () => {
  it(
    'creates a vs-bot game and assigns the human seat',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The creator owns mini-legal armies for both sides, matching the mode they ask for.
      const { store } = liveGameStore({
        [blackArmyId]: miniArmy(blackArmyId),
        [whiteArmyId]: miniArmy(whiteArmyId),
      });

      // The human asks for white; black is left to the bot.
      const body: CreateVsBotGameBody = {
        blackArmyId,
        gameMode: 'mini',
        humanSide: 'white',
        whiteArmyId,
      };

      const result = await createVsBotGame(store, 'human-sub', body);
      expect(result).toMatchObject({ success: true, data: expect.any(String) });
      assert.ok(result.success);
      // The human subject holds their chosen side; the other seat is the bot's fixed subject.
      expect(getSeatSubject(store, result.data, 'white')).toBe('human-sub');
      expect(getSeatSubject(store, result.data, 'black')).toBe('bot:prevail');
    },
  );

  it(
    'initializes the event stream for the setup round so setup submits',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // Mini-legal armies; the engine ports are kept to read the stored game and stream back.
      const { store, enginePorts } = liveGameStore({
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

      // Setup happens in round 0, so only round 0 has a stream; round 1 has none yet.
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

      // A fresh mini game opens with white owing its setup, so the stored game is playable.
      const game = await enginePorts.gameStorage.getGame(created.data, 'mini');
      expect(game).toMatchObject({ result: true, data: expect.anything() });
      assert.ok(game !== undefined);
      assert.ok(game.result);

      const options = getLegalPlayerChoiceOptions(
        gameSchema.parse(game.data).gameState,
      );
      expect(options).toMatchObject({ choiceType: 'setupUnits' });
      assert.ok(options !== null);
      assert.ok(options.choiceType === 'setupUnits');

      // Place every unit the rules offer, on the coordinates they offer, facing south, so the setup is legal.
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
      // White's setup goes through the use case; it only succeeds if the round 0 stream was opened at creation.
      const submitted = await submitPlayerChoice(store, {
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

      expect(submitted).toStrictEqual({ data: undefined, success: true });
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
      const result = await createVsBotGame(store, 'human-sub', {
        blackArmyId,
        gameMode: 'mini',
        humanSide: 'white',
        whiteArmyId,
      });

      expect(result).toMatchObject({ status: 400, success: false });
    },
  );

  it(
    'stores the standard mode from the create body',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // Standard-mode-legal armies, so a standard game can be created.
      const { store, enginePorts } = liveGameStore({
        [blackArmyId]: standardArmy(blackArmyId),
        [whiteArmyId]: standardArmy(whiteArmyId),
      });

      // The body names standard; the stored game must keep that mode, not a default.
      const created = await createVsBotGame(store, 'auth0|human-sub', {
        blackArmyId,
        gameMode: 'standard',
        humanSide: 'white',
        whiteArmyId,
      });
      expect(created.success).toBe(true);
      assert.ok(created.success);

      const game = await enginePorts.gameStorage.getGame(
        created.data,
        'standard',
      );

      expect(game).toMatchObject({
        data: { gameMode: 'standard' },
        result: true,
      });
    },
  );
});
