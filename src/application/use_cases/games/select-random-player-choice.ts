import {
  PLAYER_CHOICE_EVENT_TYPE,
  getLegalLineEndsForIssueCommand,
  getLegalRangedAttackTargets,
  getLegalUnitMoves,
  getLegalUnitsForIssueCommand,
  getLineSegmentFromStart,
} from '@classicalmoser/prevail-rules/domain';
import type {
  Command,
  GameState,
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
  PlayerSide,
  UnitInstance,
  UnitWithPlacement,
} from '@classicalmoser/prevail-rules/domain';

/** Injectable [0, 1) source so bots stay deterministic in tests. */
interface RandomSource {
  nextFloat: () => number;
}

interface SelectRandomPlayerChoiceInput {
  options: LegalPlayerChoiceOptions;
  state: GameState;
  actingPlayer: PlayerSide;
  random?: RandomSource;
}

const defaultRandom: RandomSource = {
  nextFloat: () => Math.random(),
};

const pickIndex = (length: number, random: RandomSource): number =>
  Math.floor(random.nextFloat() * length);

const pickOne = <T>(
  items: readonly T[],
  random: RandomSource,
): T | undefined => {
  if (items.length === 0) {
    return undefined;
  }
  return items[pickIndex(items.length, random)];
};

const shuffleCopy = <T>(items: readonly T[], random: RandomSource): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = pickIndex(i + 1, random);
    const tmp = copy[i] as T;
    copy[i] = copy[j] as T;
    copy[j] = tmp;
  }
  return copy;
};

const setupFacing = (player: PlayerSide): 'north' | 'south' =>
  player === 'white' ? 'south' : 'north';

const pickEventForPlayer = <T extends { player: PlayerSide }>(
  events: readonly T[],
  actingPlayer: PlayerSide,
  random: RandomSource,
): T | undefined =>
  pickOne(
    events.filter((event) => event.player === actingPlayer),
    random,
  );

const pickRoutDiscard = (
  options: Extract<
    LegalPlayerChoiceOptions,
    { choiceType: 'chooseRoutDiscard' }
  >,
  actingPlayer: PlayerSide,
  random: RandomSource,
): PlayerChoiceEvent | undefined => {
  const { routDiscard } = options;
  if (routDiscard.player !== actingPlayer) {
    return undefined;
  }
  if (routDiscard.cardIds.length < routDiscard.numberToDiscard) {
    return undefined;
  }
  const cardIds = shuffleCopy(routDiscard.cardIds, random).slice(
    0,
    routDiscard.numberToDiscard,
  );
  return {
    cardIds,
    choiceType: 'chooseRoutDiscard',
    eventNumber: options.expectedEventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: actingPlayer,
  };
};

const unitInstanceKey = (unit: {
  playerSide: string;
  unitType: { id: string };
  instanceNumber: number;
}): string =>
  `${unit.playerSide}:${unit.unitType.id}:${unit.instanceNumber}`;

/** Greedy cover: fill each grant's slots with unused eligible units. */
const pickAssignUnitSupport = (
  options: Extract<
    LegalPlayerChoiceOptions,
    { choiceType: 'assignUnitSupport' }
  >,
  actingPlayer: PlayerSide,
  random: RandomSource,
): PlayerChoiceEvent | undefined => {
  const { unitSupportGrants } = options;
  if (unitSupportGrants.player !== actingPlayer) {
    return undefined;
  }
  const covered = new Set<string>();
  const assignments: {
    cardId: string;
    units: (typeof unitSupportGrants.grants)[number]['eligibleUnits'][number][];
  }[] = [];

  for (const grant of shuffleCopy([...unitSupportGrants.grants], random)) {
    const available = shuffleCopy(
      grant.eligibleUnits.filter((unit) => !covered.has(unitInstanceKey(unit))),
      random,
    ).slice(0, grant.unitSupport.count);
    if (available.length === 0) {
      continue;
    }
    for (const unit of available) {
      covered.add(unitInstanceKey(unit));
    }
    assignments.push({ cardId: grant.card.id, units: [...available] });
  }

  return {
    assignments,
    choiceType: 'assignUnitSupport',
    eventNumber: options.expectedEventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: actingPlayer,
  };
};

const pickMoveCommander = (
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'moveCommander' }>,
  actingPlayer: PlayerSide,
  random: RandomSource,
): PlayerChoiceEvent | undefined => {
  const { startingCoordinate, destinations } = options;
  if (startingCoordinate === null) {
    return undefined;
  }
  const to = pickOne(destinations, random);
  if (to === undefined) {
    return undefined;
  }
  return {
    choiceType: 'moveCommander',
    eventNumber: options.expectedEventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    from: startingCoordinate,
    player: actingPlayer,
    to,
  };
};

const pickMoveUnit = (input: {
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'moveUnit' }>;
  actingPlayer: PlayerSide;
  state: GameState;
  random: RandomSource;
}): PlayerChoiceEvent | undefined => {
  const { options, actingPlayer, state, random } = input;
  const { moveUnits } = options;
  if (moveUnits.player !== actingPlayer) {
    return undefined;
  }
  const unit = pickOne(moveUnits.units, random);
  if (unit === undefined) {
    return undefined;
  }
  let destinations: UnitWithPlacement['placement'][] | undefined = undefined;
  try {
    destinations = [...getLegalUnitMoves(unit, state)];
  } catch {
    destinations = undefined;
  }
  if (destinations === undefined) {
    return undefined;
  }
  const to = pickOne(destinations, random);
  if (to === undefined) {
    return undefined;
  }
  return {
    choiceType: 'moveUnit',
    eventNumber: options.expectedEventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    moveCommander: false,
    player: actingPlayer,
    to,
    unit,
  };
};

const doneIssuingCommandsEvent = (
  actingPlayer: PlayerSide,
  expectedEventNumber: number,
): PlayerChoiceEvent => ({
  choiceType: 'doneIssuingCommands',
  eventNumber: expectedEventNumber,
  eventType: PLAYER_CHOICE_EVENT_TYPE,
  player: actingPlayer,
});

const tryBuildIssueCommand = (input: {
  command: Command;
  actingPlayer: PlayerSide;
  expectedEventNumber: number;
  state: GameState;
  random: RandomSource;
}): PlayerChoiceEvent | undefined => {
  const { command, actingPlayer, expectedEventNumber, state, random } = input;

  if (command.size === 'units') {
    const eligible = getLegalUnitsForIssueCommand(command, actingPlayer, state);
    if (eligible.length < command.number) {
      return undefined;
    }
    const units = shuffleCopy(eligible, random)
      .slice(0, command.number)
      .map((uwp) => uwp.unit);
    return {
      choiceType: 'issueCommand',
      command,
      eventNumber: expectedEventNumber,
      eventType: PLAYER_CHOICE_EVENT_TYPE,
      player: actingPlayer,
      units,
    };
  }

  // size === 'lines' — random start, random legal end, then segment between.
  const starts = getLegalUnitsForIssueCommand(command, actingPlayer, state);
  const start = pickOne(starts, random);
  if (start === undefined) {
    return undefined;
  }
  const ends = getLegalLineEndsForIssueCommand(
    command,
    actingPlayer,
    state,
    start,
  );
  const end = pickOne(ends, random);
  if (end === undefined) {
    return undefined;
  }
  const segment = getLineSegmentFromStart(command, state, start);
  const startIndex = segment.findIndex(
    (uwp) =>
      uwp.unit.playerSide === start.unit.playerSide &&
      uwp.unit.unitType.id === start.unit.unitType.id &&
      uwp.unit.instanceNumber === start.unit.instanceNumber,
  );
  const endIndex = segment.findIndex(
    (uwp) =>
      uwp.unit.playerSide === end.unit.playerSide &&
      uwp.unit.unitType.id === end.unit.unitType.id &&
      uwp.unit.instanceNumber === end.unit.instanceNumber,
  );
  if (startIndex === -1 || endIndex === -1) {
    return undefined;
  }
  // Validators treat units[0] as the inspired start — keep start→end order.
  const units: UnitInstance[] =
    startIndex <= endIndex
      ? segment.slice(startIndex, endIndex + 1).map((uwp) => uwp.unit)
      : segment
          .slice(endIndex, startIndex + 1)
          .toReversed()
          .map((uwp) => uwp.unit);
  return {
    choiceType: 'issueCommand',
    command,
    eventNumber: expectedEventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: actingPlayer,
    units,
  };
};

const pickIssueCommand = (input: {
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'issueCommand' }>;
  actingPlayer: PlayerSide;
  state: GameState;
  random: RandomSource;
}): PlayerChoiceEvent | undefined => {
  const { options, actingPlayer, state, random } = input;
  const { issueCommands } = options;
  if (issueCommands.player !== actingPlayer) {
    return undefined;
  }

  for (const command of shuffleCopy(issueCommands.commands, random)) {
    const built = tryBuildIssueCommand({
      actingPlayer,
      command,
      expectedEventNumber: options.expectedEventNumber,
      random,
      state,
    });
    if (built !== undefined) {
      return built;
    }
  }

  // No remaining slot is issuable (or build failed) — forfeit leftovers.
  if (options.canDoneIssuing) {
    return doneIssuingCommandsEvent(actingPlayer, options.expectedEventNumber);
  }
  return undefined;
};

const pickRangedAttack = (input: {
  options: Extract<
    LegalPlayerChoiceOptions,
    { choiceType: 'performRangedAttack' }
  >;
  actingPlayer: PlayerSide;
  state: GameState;
  random: RandomSource;
}): PlayerChoiceEvent | undefined => {
  const { options, actingPlayer, state, random } = input;
  const { rangedAttackers } = options;
  if (rangedAttackers.player !== actingPlayer) {
    return undefined;
  }
  const match = shuffleCopy(rangedAttackers.attackers, random)
    .map((unit) => ({
      targetUnit: pickOne(getLegalRangedAttackTargets(unit, state), random),
      unit,
    }))
    .find((entry) => entry.targetUnit !== undefined);
  if (match?.targetUnit === undefined) {
    return undefined;
  }
  return {
    choiceType: 'performRangedAttack',
    eventNumber: options.expectedEventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: actingPlayer,
    supportingUnits: [],
    targetUnit: match.targetUnit,
    unit: match.unit,
  };
};

const pickSetupUnits = (
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'setupUnits' }>,
  actingPlayer: PlayerSide,
  random: RandomSource,
): PlayerChoiceEvent | undefined => {
  const { setupUnits } = options;
  if (setupUnits.player !== actingPlayer) {
    return undefined;
  }
  if (
    setupUnits.units.length === 0 ||
    setupUnits.coordinates.length < setupUnits.units.length
  ) {
    return undefined;
  }
  const coordinates = shuffleCopy(setupUnits.coordinates, random).slice(
    0,
    setupUnits.units.length,
  );
  const facing = setupFacing(actingPlayer);
  const unitPlacements: UnitWithPlacement[] = setupUnits.units.map(
    (unit, index) => ({
      placement: {
        coordinate: coordinates[index] as (typeof coordinates)[number],
        facing,
      },
      unit,
    }),
  );
  const commanderCoordinate = unitPlacements[0]?.placement.coordinate;
  if (commanderCoordinate === undefined) {
    return undefined;
  }
  return {
    choiceType: 'setupUnits',
    commanderCoordinate,
    eventNumber: options.expectedEventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: actingPlayer,
    unitPlacements,
  };
};

/**
 * Pure random selection of one legal {@link PlayerChoiceEvent} for `actingPlayer`.
 * Returns `undefined` when that seat has no sampleable option under the given payload.
 */
const selectRandomPlayerChoice = (
  input: SelectRandomPlayerChoiceInput,
): PlayerChoiceEvent | undefined => {
  const { options, state, actingPlayer } = input;
  const random = input.random ?? defaultRandom;
  switch (options.choiceType) {
    case 'assignUnitSupport': {
      return pickAssignUnitSupport(options, actingPlayer, random);
    }
    case 'chooseCard': {
      return pickEventForPlayer(options.events, actingPlayer, random);
    }
    case 'chooseMeleeResolution': {
      return pickEventForPlayer(options.events, actingPlayer, random);
    }
    case 'chooseRally': {
      return pickEventForPlayer(options.events, actingPlayer, random);
    }
    case 'chooseRetreatOption': {
      return pickEventForPlayer(options.events, actingPlayer, random);
    }
    case 'chooseWhetherToRetreat': {
      return pickEventForPlayer(options.events, actingPlayer, random);
    }
    case 'commitToMelee': {
      return pickEventForPlayer(options.events, actingPlayer, random);
    }
    case 'commitToMovement': {
      return pickEventForPlayer(options.events, actingPlayer, random);
    }
    case 'commitToRangedAttack': {
      return pickEventForPlayer(options.events, actingPlayer, random);
    }
    case 'doneIssuingCommands': {
      return pickEventForPlayer(options.events, actingPlayer, random);
    }
    case 'chooseRoutDiscard': {
      return pickRoutDiscard(options, actingPlayer, random);
    }
    case 'moveCommander': {
      return pickMoveCommander(options, actingPlayer, random);
    }
    case 'moveUnit': {
      return pickMoveUnit({ actingPlayer, options, random, state });
    }
    case 'issueCommand': {
      return pickIssueCommand({ actingPlayer, options, random, state });
    }
    case 'performRangedAttack': {
      return pickRangedAttack({ actingPlayer, options, random, state });
    }
    case 'setupUnits': {
      return pickSetupUnits(options, actingPlayer, random);
    }
    default: {
      const _exhaustive: never = options;
      return _exhaustive;
    }
  }
};

export type { RandomSource, SelectRandomPlayerChoiceInput };
export { selectRandomPlayerChoice };
