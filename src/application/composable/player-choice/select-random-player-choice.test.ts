import assert from 'node:assert/strict';
import type {
  Command,
  CommandCard,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import {
  CLEANUP_PHASE,
  ISSUE_COMMANDS_PHASE,
  addCommanderToBoard,
  addUnitToBoard,
  createEmptyGameState,
  createUnitInstance,
  getLegalPlayerChoiceOptions,
  tempCommandCards,
  tempUnits,
  updateBoardState,
  updatePhaseState,
  updatePlayerCardState,
  validatePlayerChoice,
} from '@classicalmoser/prevail-rules/domain';
import { selectRandomPlayerChoice } from './select-random-player-choice';
import type { RandomSource } from './random-source';

/* Domain wire values use null for refuse commits and empty card slots. */
/* eslint-disable unicorn/no-null -- protocol nulls in fixtures */

/** Always picks the first candidate (index 0). */
const firstAlways: RandomSource = {
  nextFloat: () => 0,
};

const unitType = tempUnits[0];
assert.ok(unitType !== undefined);

/** Sample deck card. Fails the suite if that name leaves the fixture. */
const commandCardNamed = (name: string): CommandCard => {
  const card = tempCommandCards.find((candidate) => candidate.name === name);
  assert.ok(card !== undefined);
  return card;
};

const strike = commandCardNamed('Strike');
const evade = commandCardNamed('Evade');
const volley = commandCardNamed('Volley');
const charge = commandCardNamed('Charge');
const move = commandCardNamed('Move');

const issuePhase = (
  remainingCommandsFirstPlayer: Command[],
): {
  currentCommandResolutionState: 'pending';
  phase: typeof ISSUE_COMMANDS_PHASE;
  remainingCommandsFirstPlayer: Command[];
  remainingCommandsSecondPlayer: Command[];
  remainingUnitsFirstPlayer: [];
  remainingUnitsSecondPlayer: [];
  step: 'firstPlayerIssueCommands';
} => ({
  currentCommandResolutionState: 'pending',
  phase: ISSUE_COMMANDS_PHASE,
  remainingCommandsFirstPlayer,
  remainingCommandsSecondPlayer: [],
  remainingUnitsFirstPlayer: [],
  remainingUnitsSecondPlayer: [],
  step: 'firstPlayerIssueCommands',
});

/** Transforms empty state starts with empty hands; keep both non-empty for endgame. */
const seedPlayableIssueState = (
  state: ReturnType<typeof createEmptyGameState>,
): ReturnType<typeof createEmptyGameState> => {
  let next = { ...state, currentInitiative: 'black' as const };
  next = updatePlayerCardState(next, 'black', {
    awaitingPlay: null,
    burnt: [],
    discarded: [],
    inHand: [strike],
    inPlay: evade,
    played: [],
  });
  next = updatePlayerCardState(next, 'white', {
    awaitingPlay: null,
    burnt: [],
    discarded: [],
    inHand: [volley],
    inPlay: charge,
    played: [],
  });
  return next;
};

describe('selectRandomPlayerChoice function', () => {
  it(
    'picks an event for the acting player from a list choice',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const options: LegalPlayerChoiceOptions = {
        choiceType: 'chooseWhetherToRetreat',
        events: [
          {
            choiceType: 'chooseWhetherToRetreat',
            eventNumber: 3,
            eventType: 'playerChoice',
            player: 'black',
            choosesToRetreat: false,
          },
          {
            choiceType: 'chooseWhetherToRetreat',
            eventNumber: 3,
            eventType: 'playerChoice',
            player: 'black',
            choosesToRetreat: true,
          },
        ],
        expectedEventNumber: 3,
        playerSource: 'black',
      };

      const choice = selectRandomPlayerChoice({
        actingPlayer: 'black',
        options,
        random: firstAlways,
        state: createEmptyGameState('mini'),
      });

      expect(choice).toMatchObject({
        choiceType: 'chooseWhetherToRetreat',
        choosesToRetreat: false,
        eventNumber: 3,
        player: 'black',
      });
    },
  );

  it(
    'ignores peer events when bothPlayers still choose',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const whiteCard = strike;
      const blackCard = evade;

      const options: LegalPlayerChoiceOptions = {
        choiceType: 'chooseCard',
        events: [
          {
            card: whiteCard,
            choiceType: 'chooseCard',
            eventNumber: 0,
            eventType: 'playerChoice',
            player: 'white',
          },
          {
            card: blackCard,
            choiceType: 'chooseCard',
            eventNumber: 0,
            eventType: 'playerChoice',
            player: 'black',
          },
        ],
        expectedEventNumber: 0,
        playerSource: 'bothPlayers',
      };

      const choice = selectRandomPlayerChoice({
        actingPlayer: 'black',
        options,
        random: firstAlways,
        state: createEmptyGameState('mini'),
      });

      expect(choice).toMatchObject({
        card: { id: blackCard.id },
        player: 'black',
      });
    },
  );

  it(
    'returns undefined when the acting seat has no options',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const options: LegalPlayerChoiceOptions = {
        choiceType: 'chooseWhetherToRetreat',
        events: [
          {
            choiceType: 'chooseWhetherToRetreat',
            eventNumber: 1,
            eventType: 'playerChoice',
            player: 'white',
            choosesToRetreat: true,
          },
        ],
        expectedEventNumber: 1,
        playerSource: 'white',
      };

      expect(
        selectRandomPlayerChoice({
          actingPlayer: 'black',
          options,
          random: firstAlways,
          state: createEmptyGameState('mini'),
        }),
      ).toBeUndefined();
    },
  );

  it('builds a rout-discard choice from card atoms', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const options: LegalPlayerChoiceOptions = {
      choiceType: 'chooseRoutDiscard',
      expectedEventNumber: 4,
      playerSource: 'black',
      routDiscard: {
        cardIds: ['a', 'b', 'c'],
        numberToDiscard: 2,
        player: 'black',
      },
    };

    const choice = selectRandomPlayerChoice({
      actingPlayer: 'black',
      options,
      random: firstAlways,
      state: createEmptyGameState('mini'),
    });

    expect(choice).toMatchObject({
      cardIds: expect.any(Array),
      choiceType: 'chooseRoutDiscard',
      player: 'black',
    });
    assert.ok(choice !== undefined);
    assert.ok(choice.choiceType === 'chooseRoutDiscard');
    expect(choice.cardIds).toHaveLength(2);
    expect(new Set(choice.cardIds).size).toBe(2);
    expect(choice.cardIds.every((id) => ['a', 'b', 'c'].includes(id))).toBe(
      true,
    );
  });

  it(
    'builds a valid units-sized issueCommand from legality atoms',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const command: Command = {
        ...strike.command,
        number: 1,
        restrictions: {
          inspirationRangeRestriction: -1,
          restrictionType: 'none',
        },
        size: 'units',
      };
      const unit = {
        placement: { coordinate: 'E-5' as const, facing: 'north' as const },
        unit: createUnitInstance('black', unitType, 1),
      };
      let state = seedPlayableIssueState(createEmptyGameState('mini'));
      let board = addUnitToBoard(state.boardState, unit);
      board = addCommanderToBoard(board, 'black', 'E-5');
      state = updateBoardState(state, board);
      state = updatePhaseState(state, issuePhase([command]));

      const options = getLegalPlayerChoiceOptions(state);
      assert.ok(options !== null);
      assert.ok(options.choiceType === 'issueCommand');

      const choice = selectRandomPlayerChoice({
        actingPlayer: 'black',
        options,
        random: firstAlways,
        state,
      });

      assert.ok(choice !== undefined);
      assert.ok(choice.choiceType === 'issueCommand');
      expect(choice).toMatchObject({
        choiceType: 'issueCommand',
        player: 'black',
        units: [unit.unit],
      });
      expect(validatePlayerChoice(choice, state)).toStrictEqual({
        result: true,
      });
    },
  );

  it(
    'falls back to doneIssuingCommands when no remaining slot is issuable',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const command: Command = {
        ...strike.command,
        number: 1,
        restrictions: {
          inspirationRangeRestriction: -1,
          restrictionType: 'none',
        },
        size: 'units',
      };
      const state = updatePhaseState(
        createEmptyGameState('mini'),
        issuePhase([command]),
      );

      const choice = selectRandomPlayerChoice({
        actingPlayer: 'black',
        options: {
          canDoneIssuing: true,
          choiceType: 'issueCommand',
          expectedEventNumber: 7,
          issueCommands: { commands: [command], player: 'black' },
          playerSource: 'black',
        },
        random: firstAlways,
        state,
      });

      expect(choice).toStrictEqual({
        choiceType: 'doneIssuingCommands',
        eventNumber: 7,
        eventType: 'playerChoice',
        player: 'black',
      });
    },
  );

  it(
    'picks doneIssuingCommands when that is the expected choice',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const choice = selectRandomPlayerChoice({
        actingPlayer: 'black',
        options: {
          choiceType: 'doneIssuingCommands',
          events: [
            {
              choiceType: 'doneIssuingCommands',
              eventNumber: 2,
              eventType: 'playerChoice',
              player: 'black',
            },
          ],
          expectedEventNumber: 2,
          playerSource: 'black',
        },
        random: firstAlways,
        state: createEmptyGameState('mini'),
      });

      expect(choice).toMatchObject({
        choiceType: 'doneIssuingCommands',
        player: 'black',
      });
    },
  );

  it(
    'picks a front-engagement commitToMovement card when available',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const moveCard = move;
      const options: LegalPlayerChoiceOptions = {
        choiceType: 'commitToMovement',
        events: [
          {
            choiceType: 'commitToMovement',
            committedCard: moveCard,
            eventNumber: 2,
            eventType: 'playerChoice',
            modifierTypes: ['speed'],
            player: 'white',
          },
          {
            choiceType: 'commitToMovement',
            committedCard: null,
            eventNumber: 2,
            eventType: 'playerChoice',
            modifierTypes: [],
            player: 'white',
          },
        ],
        expectedEventNumber: 2,
        playerSource: 'white',
      };

      const choice = selectRandomPlayerChoice({
        actingPlayer: 'white',
        options,
        random: firstAlways,
        state: createEmptyGameState('mini'),
      });

      expect(choice).toMatchObject({
        choiceType: 'commitToMovement',
        committedCard: moveCard,
        player: 'white',
      });
    },
  );

  it(
    'refuses front-engagement commitToMovement when that is the only option',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const choice = selectRandomPlayerChoice({
        actingPlayer: 'white',
        options: {
          choiceType: 'commitToMovement',
          events: [
            {
              choiceType: 'commitToMovement',
              committedCard: null,
              eventNumber: 2,
              eventType: 'playerChoice',
              modifierTypes: [],
              player: 'white',
            },
          ],
          expectedEventNumber: 2,
          playerSource: 'white',
        },
        random: firstAlways,
        state: createEmptyGameState('mini'),
      });

      expect(choice).toStrictEqual({
        choiceType: 'commitToMovement',
        committedCard: null,
        eventNumber: 2,
        eventType: 'playerChoice',
        modifierTypes: [],
        player: 'white',
      });
    },
  );

  it(
    'greedily assigns unit support slots without double-covering units',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const unitA = createUnitInstance('white', unitType, 1);
      const unitB = createUnitInstance('white', unitType, 2);
      const cardA = {
        ...strike,
        unitSupport: { count: 1, supportType: 'generic' as const },
      };
      const cardB = {
        ...evade,
        unitSupport: { count: 1, supportType: 'generic' as const },
      };

      let state = createEmptyGameState('mini');
      state = { ...state, currentInitiative: 'white' };
      // Transforms empty state has empty hands; keep black non-empty so
      // empty-hand endgame does not preempt assignUnitSupport.
      state = updatePlayerCardState(state, 'black', {
        awaitingPlay: null,
        burnt: [],
        discarded: [],
        inHand: [volley],
        inPlay: null,
        played: [],
      });
      state = updatePlayerCardState(state, 'white', {
        awaitingPlay: null,
        burnt: [],
        discarded: [],
        inHand: [cardA, cardB],
        inPlay: null,
        played: [],
      });
      let board = addUnitToBoard(state.boardState, {
        placement: { coordinate: 'E-5', facing: 'south' },
        unit: unitA,
      });
      board = addUnitToBoard(board, {
        placement: { coordinate: 'E-6', facing: 'south' },
        unit: unitB,
      });
      state = updateBoardState(state, board);
      state = updatePhaseState(state, {
        firstPlayerRallyResolutionState: {
          completed: false,
          playerRallied: true,
          rallyResolved: true,
          routState: 'pending',
          unitsLostSupport: 'pending',
        },
        phase: CLEANUP_PHASE,
        secondPlayerRallyResolutionState: 'pending',
        step: 'firstPlayerResolveRally',
      });

      const options = getLegalPlayerChoiceOptions(state);
      assert.ok(options !== null);
      assert.ok(options.choiceType === 'assignUnitSupport');

      const choice = selectRandomPlayerChoice({
        actingPlayer: 'white',
        options,
        random: firstAlways,
        state,
      });

      assert.ok(choice !== undefined);
      assert.ok(choice.choiceType === 'assignUnitSupport');
      // Identical generic grants sum into one category with count 2.
      expect(choice.assignments).toHaveLength(1);
      expect(choice.assignments[0]?.unitSupport).toStrictEqual({
        count: 2,
        supportType: 'generic',
      });
      const coveredKeys = choice.assignments.flatMap((assignment) =>
        assignment.units.map(
          (unit) =>
            `${unit.playerSide}:${unit.unitType.id}:${unit.instanceNumber}`,
        ),
      );
      expect(coveredKeys).toHaveLength(2);
      expect(new Set(coveredKeys).size).toBe(2);
      expect(validatePlayerChoice(choice, state)).toStrictEqual({
        result: true,
      });
    },
  );

  it(
    'builds a valid line issueCommand with start first when end is left of start',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // Range 0: only the commander-space unit is a legal start. Segment still
      // includes the western neighbor; firstAlways picks that neighbor as end.
      const command: Command = {
        ...move.command,
        number: 1,
        restrictions: {
          inspirationRangeRestriction: 0,
          restrictionType: 'none',
        },
        size: 'lines',
      };
      const start = {
        placement: { coordinate: 'E-5' as const, facing: 'north' as const },
        unit: createUnitInstance('black', unitType, 1),
      };
      const west = {
        placement: { coordinate: 'E-4' as const, facing: 'north' as const },
        unit: createUnitInstance('black', unitType, 2),
      };
      let state = seedPlayableIssueState(createEmptyGameState('mini'));
      let board = addUnitToBoard(state.boardState, start);
      board = addUnitToBoard(board, west);
      board = addCommanderToBoard(board, 'black', 'E-5');
      state = updateBoardState(state, board);
      state = updatePhaseState(state, issuePhase([command]));

      const options = getLegalPlayerChoiceOptions(state);
      assert.ok(options !== null);
      assert.ok(options.choiceType === 'issueCommand');

      const choice = selectRandomPlayerChoice({
        actingPlayer: 'black',
        options,
        random: firstAlways,
        state,
      });

      assert.ok(choice !== undefined);
      assert.ok(choice.choiceType === 'issueCommand');
      expect(choice.units[0]).toMatchObject({ instanceNumber: 1 });
      expect(choice.units.at(-1)).toMatchObject({ instanceNumber: 2 });
      expect(validatePlayerChoice(choice, state)).toStrictEqual({
        result: true,
      });
    },
  );
});
