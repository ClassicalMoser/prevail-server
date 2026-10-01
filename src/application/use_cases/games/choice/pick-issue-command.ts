import {
  PLAYER_CHOICE_EVENT_TYPE,
  getLegalLineEndsForIssueCommand,
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
} from '@classicalmoser/prevail-rules/domain';
import type { RandomSource } from './random-source';
import { pickOne } from './pick-one';
import { shuffleCopy } from './shuffle-copy';

const doneIssuingCommandsEvent = (
  actingPlayer: PlayerSide,
  expectedEventNumber: number,
): PlayerChoiceEvent => {
  const choice: PlayerChoiceEvent = {
    choiceType: 'doneIssuingCommands',
    eventNumber: expectedEventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: actingPlayer,
  };
  return choice;
};

/**
 * Build one issue-command event, or undefined when the command cannot be filled.
 *
 * A units command takes a random subset of the legal units. A lines command
 * picks a random start and legal end, then keeps the segment between them in
 * start-to-end order because validators treat units[0] as the inspired start.
 */
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
    const shuffledEligible = shuffleCopy(eligible, random);
    const chosen = shuffledEligible.slice(0, command.number);
    const units = chosen.map((uwp) => uwp.unit);
    const choice: PlayerChoiceEvent = {
      choiceType: 'issueCommand',
      command,
      eventNumber: expectedEventNumber,
      eventType: PLAYER_CHOICE_EVENT_TYPE,
      player: actingPlayer,
      units,
    };
    return choice;
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
  const choice: PlayerChoiceEvent = {
    choiceType: 'issueCommand',
    command,
    eventNumber: expectedEventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: actingPlayer,
    units,
  };
  return choice;
};

/**
 * Sample one issuable command. When none can be built and the options allow
 * it, forfeit the leftover commands with doneIssuingCommands.
 */
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

  if (options.canDoneIssuing) {
    const done = doneIssuingCommandsEvent(
      actingPlayer,
      options.expectedEventNumber,
    );
    return done;
  }
  return undefined;
};

export { pickIssueCommand };
