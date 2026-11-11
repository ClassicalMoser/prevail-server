import {
  PLAYER_CHOICE_EVENT_TYPE,
  getLegalLines,
  getLegalUnitsForIssueCommand,
} from '@classicalmoser/prevail-rules/domain';
import type {
  Command,
  GameState,
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import type { RandomSource } from '../random-source';
import { pickOne } from '../pick-one';
import { shuffleCopy } from '../shuffle-copy';

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
 * takes one of the lines the rules list, named by its two ends.
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
      selection: { selectionType: 'units', units },
    };
    return choice;
  }

  // size === 'lines' — one of the lines the rules list, named by its ends.
  const line = pickOne(getLegalLines(command, actingPlayer, state), random);
  if (line === undefined) {
    return undefined;
  }
  const [one, other] = line.ends;
  const choice: PlayerChoiceEvent = {
    choiceType: 'issueCommand',
    command,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: actingPlayer,
    selection: { ends: [one.unit, other.unit], selectionType: 'line' },
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
