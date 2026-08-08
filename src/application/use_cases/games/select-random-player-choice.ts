import {
  PLAYER_CHOICE_EVENT_TYPE,
  getLegalLineEndsForIssueCommand,
  getLegalRangedAttackTargets,
  getLegalUnitMoves,
  getLegalUnitsForIssueCommand,
  getLineSegmentFromStart,
} from '@classicalmoser/prevail-rules/domain';
import type {
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

const defaultRandom: RandomSource = {
  nextFloat: () => Math.random(),
};

const pickIndex = (length: number, random: RandomSource): number =>
  Math.floor(random.nextFloat() * length);

const pickOne = <T>(items: readonly T[], random: RandomSource): T | undefined => {
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
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'chooseRoutDiscard' }>,
  actingPlayer: PlayerSide,
  random: RandomSource,
): PlayerChoiceEvent | null => {
  const { routDiscard } = options;
  if (routDiscard.player !== actingPlayer) {
    return null;
  }
  if (routDiscard.cardIds.length < routDiscard.numberToDiscard) {
    return null;
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

const pickMoveCommander = (
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'moveCommander' }>,
  actingPlayer: PlayerSide,
  random: RandomSource,
): PlayerChoiceEvent | null => {
  const { startingCoordinate, destinations } = options;
  if (startingCoordinate === null) {
    return null;
  }
  const to = pickOne(destinations, random);
  if (to === undefined) {
    return null;
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

const pickMoveUnit = (
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'moveUnit' }>,
  actingPlayer: PlayerSide,
  state: GameState,
  random: RandomSource,
): PlayerChoiceEvent | null => {
  const { moveUnits } = options;
  if (moveUnits.player !== actingPlayer) {
    return null;
  }
  const unit = pickOne(moveUnits.units, random);
  if (unit === undefined) {
    return null;
  }
  let destinations: UnitWithPlacement['placement'][];
  try {
    destinations = [...getLegalUnitMoves(unit, state)];
  } catch {
    return null;
  }
  const to = pickOne(destinations, random);
  if (to === undefined) {
    return null;
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

const pickIssueCommand = (
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'issueCommand' }>,
  actingPlayer: PlayerSide,
  state: GameState,
  random: RandomSource,
): PlayerChoiceEvent | null => {
  const { issueCommands } = options;
  if (issueCommands.player !== actingPlayer) {
    return null;
  }
  const command = pickOne(issueCommands.commands, random);
  if (command === undefined) {
    return null;
  }

  if (command.size === 'units') {
    const eligible = getLegalUnitsForIssueCommand(
      command,
      actingPlayer,
      state,
    );
    if (eligible.length < command.number) {
      return null;
    }
    const units = shuffleCopy(eligible, random)
      .slice(0, command.number)
      .map((uwp) => uwp.unit);
    return {
      choiceType: 'issueCommand',
      command,
      eventNumber: options.expectedEventNumber,
      eventType: PLAYER_CHOICE_EVENT_TYPE,
      player: actingPlayer,
      units,
    };
  }

  // size === 'lines' — random start, random legal end, then segment between.
  const starts = getLegalUnitsForIssueCommand(command, actingPlayer, state);
  const start = pickOne(starts, random);
  if (start === undefined) {
    return null;
  }
  const ends = getLegalLineEndsForIssueCommand(
    command,
    actingPlayer,
    state,
    start,
  );
  const end = pickOne(ends, random);
  if (end === undefined) {
    return null;
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
    return null;
  }
  const low = Math.min(startIndex, endIndex);
  const high = Math.max(startIndex, endIndex);
  const units: UnitInstance[] = segment
    .slice(low, high + 1)
    .map((uwp) => uwp.unit);
  return {
    choiceType: 'issueCommand',
    command,
    eventNumber: options.expectedEventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: actingPlayer,
    units,
  };
};

const pickRangedAttack = (
  options: Extract<
    LegalPlayerChoiceOptions,
    { choiceType: 'performRangedAttack' }
  >,
  actingPlayer: PlayerSide,
  state: GameState,
  random: RandomSource,
): PlayerChoiceEvent | null => {
  const { rangedAttackers } = options;
  if (rangedAttackers.player !== actingPlayer) {
    return null;
  }
  const shuffledAttackers = shuffleCopy(rangedAttackers.attackers, random);
  for (const unit of shuffledAttackers) {
    const targets = getLegalRangedAttackTargets(unit, state);
    const targetUnit = pickOne(targets, random);
    if (targetUnit === undefined) {
      continue;
    }
    return {
      choiceType: 'performRangedAttack',
      eventNumber: options.expectedEventNumber,
      eventType: PLAYER_CHOICE_EVENT_TYPE,
      player: actingPlayer,
      supportingUnits: [],
      targetUnit,
      unit,
    };
  }
  return null;
};

const pickSetupUnits = (
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'setupUnits' }>,
  actingPlayer: PlayerSide,
  random: RandomSource,
): PlayerChoiceEvent | null => {
  const { setupUnits } = options;
  if (setupUnits.player !== actingPlayer) {
    return null;
  }
  if (
    setupUnits.units.length === 0 ||
    setupUnits.coordinates.length < setupUnits.units.length
  ) {
    return null;
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
  return {
    choiceType: 'setupUnits',
    eventNumber: options.expectedEventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: actingPlayer,
    unitPlacements,
  };
};

/**
 * Pure random selection of one legal {@link PlayerChoiceEvent} for `actingPlayer`.
 * Returns `null` when that seat has no sampleable option under the given payload.
 */
const selectRandomPlayerChoice = (
  options: LegalPlayerChoiceOptions,
  state: GameState,
  actingPlayer: PlayerSide,
  random: RandomSource = defaultRandom,
): PlayerChoiceEvent | null => {
  switch (options.choiceType) {
    case 'chooseCard': {
      return pickEventForPlayer(options.events, actingPlayer, random) ?? null;
    }
    case 'chooseMeleeResolution': {
      return pickEventForPlayer(options.events, actingPlayer, random) ?? null;
    }
    case 'chooseRally': {
      return pickEventForPlayer(options.events, actingPlayer, random) ?? null;
    }
    case 'chooseRetreatOption': {
      return pickEventForPlayer(options.events, actingPlayer, random) ?? null;
    }
    case 'chooseWhetherToRetreat': {
      return pickEventForPlayer(options.events, actingPlayer, random) ?? null;
    }
    case 'commitToMelee': {
      return pickEventForPlayer(options.events, actingPlayer, random) ?? null;
    }
    case 'commitToMovement': {
      return pickEventForPlayer(options.events, actingPlayer, random) ?? null;
    }
    case 'commitToRangedAttack': {
      return pickEventForPlayer(options.events, actingPlayer, random) ?? null;
    }
    case 'chooseRoutDiscard': {
      return pickRoutDiscard(options, actingPlayer, random);
    }
    case 'moveCommander': {
      return pickMoveCommander(options, actingPlayer, random);
    }
    case 'moveUnit': {
      return pickMoveUnit(options, actingPlayer, state, random);
    }
    case 'issueCommand': {
      return pickIssueCommand(options, actingPlayer, state, random);
    }
    case 'performRangedAttack': {
      return pickRangedAttack(options, actingPlayer, state, random);
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

export type { RandomSource };
export { selectRandomPlayerChoice };
