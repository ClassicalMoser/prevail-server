import {
  PLAYER_CHOICE_EVENT_TYPE,
  getLegalLineEndsForIssueCommand,
  getLegalUnitsForIssueCommand,
} from '@classicalmoser/prevail-rules/domain';
import type {
  Command,
  GameState,
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
  PlayerSide,
  UnitInstance,
} from '@classicalmoser/prevail-rules/domain';
import type { RandomSource } from '../random-source';
import { pickOne } from '../pick-one';
import { shuffleCopy } from '../shuffle-copy';

const same = (a: UnitInstance, b: UnitInstance): boolean =>
  a.playerSide === b.playerSide &&
  a.unitType.id === b.unitType.id &&
  a.instanceNumber === b.instanceNumber;

const doneIssuingCommandsEvent = (
  actingPlayer: PlayerSide,
): PlayerChoiceEvent => {
  const choice: PlayerChoiceEvent = {
    choiceType: 'doneIssuingCommands',
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
  state: GameState;
  random: RandomSource;
}): PlayerChoiceEvent | undefined => {
  const { command, actingPlayer, state, random } = input;

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
  // The ends come back in rank order and always include the start, so the
  // line is the stretch of them between the two ends.
  const startIndex = ends.findIndex((uwp) => same(uwp.unit, start.unit));
  const endIndex = ends.findIndex((uwp) => same(uwp.unit, end.unit));
  if (startIndex === -1 || endIndex === -1) {
    return undefined;
  }
  // Validators treat units[0] as the inspired start — keep start→end order.
  const units: UnitInstance[] =
    startIndex <= endIndex
      ? ends.slice(startIndex, endIndex + 1).map((uwp) => uwp.unit)
      : ends
          .slice(endIndex, startIndex + 1)
          .toReversed()
          .map((uwp) => uwp.unit);
  const choice: PlayerChoiceEvent = {
    choiceType: 'issueCommand',
    command,
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
      random,
      state,
    });
    if (built !== undefined) {
      return built;
    }
  }

  if (options.canDoneIssuing) {
    const done = doneIssuingCommandsEvent(actingPlayer);
    return done;
  }
  return undefined;
};

export { pickIssueCommand };
