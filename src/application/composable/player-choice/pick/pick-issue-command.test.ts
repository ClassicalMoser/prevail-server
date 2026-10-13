import assert from 'node:assert/strict';
import type {
  Command,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import {
  createEmptyGameState,
  tempCommandCards,
} from '@classicalmoser/prevail-rules/domain';
import { pickIssueCommand } from './pick-issue-command';

const firstAlways = {
  nextFloat: (): number => 0,
};

const sampleCard = tempCommandCards[0];
assert.ok(sampleCard !== undefined);

const command: Command = {
  ...sampleCard.command,
  number: 1,
  restrictions: {
    inspirationRangeRestriction: -1,
    restrictionType: 'none',
  },
  size: 'units',
};

const options = (
  overrides: Partial<
    Extract<LegalPlayerChoiceOptions, { choiceType: 'issueCommand' }>
  > = {},
): Extract<LegalPlayerChoiceOptions, { choiceType: 'issueCommand' }> => ({
  canDoneIssuing: false,
  choiceType: 'issueCommand',
  expectedEventNumber: 7,
  issueCommands: { commands: [command], player: 'black' },
  playerSource: 'black',
  ...overrides,
});

describe('pickIssueCommand function', () => {
  it(
    'returns undefined when issue commands belong to the other player',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const choice = pickIssueCommand({
        actingPlayer: 'white',
        options: options(),
        random: firstAlways,
        state: createEmptyGameState('mini'),
      });

      expect(choice).toBeUndefined();
    },
  );

  it(
    'returns undefined when nothing is issuable and doneIssuing is closed',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const choice = pickIssueCommand({
        actingPlayer: 'black',
        options: options({ canDoneIssuing: false }),
        random: firstAlways,
        state: createEmptyGameState('mini'),
      });

      expect(choice).toBeUndefined();
    },
  );

  it(
    'falls back to doneIssuingCommands when canDoneIssuing is open',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const choice = pickIssueCommand({
        actingPlayer: 'black',
        options: options({ canDoneIssuing: true }),
        random: firstAlways,
        state: createEmptyGameState('mini'),
      });

      expect(choice).toStrictEqual({
        choiceType: 'doneIssuingCommands',
        eventNumber: 7,
        eventType: 'playerChoice',
        player: 'black',
      });
    },
  );
});
