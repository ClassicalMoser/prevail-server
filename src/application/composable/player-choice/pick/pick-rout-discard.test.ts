import assert from 'node:assert/strict';
import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import { pickRoutDiscard } from './pick-rout-discard';

const firstAlways = {
  nextFloat: (): number => 0,
};

const options = (
  overrides: Partial<
    Extract<
      LegalPlayerChoiceOptions,
      { choiceType: 'chooseRoutDiscard' }
    >['routDiscard']
  > = {},
): Extract<LegalPlayerChoiceOptions, { choiceType: 'chooseRoutDiscard' }> => ({
  choiceType: 'chooseRoutDiscard',
  expectedEventNumber: 5,
  playerSource: 'black',
  routDiscard: {
    cardIds: ['a', 'b', 'c'],
    numberToDiscard: 2,
    player: 'black',
    ...overrides,
  },
});

describe('pickRoutDiscard function', () => {
  it(
    'returns undefined when the rout discard belongs to the other player',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const choice = pickRoutDiscard(
        options({ player: 'white' }),
        'black',
        firstAlways,
      );

      expect(choice).toBeUndefined();
    },
  );

  it(
    'returns undefined when there are fewer cards than the discard count',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const choice = pickRoutDiscard(
        options({ cardIds: ['a'], numberToDiscard: 2 }),
        'black',
        firstAlways,
      );

      expect(choice).toBeUndefined();
    },
  );

  it(
    'discards exactly the requested number of cards',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const choice = pickRoutDiscard(options(), 'black', firstAlways);

      assert.ok(choice !== undefined);
      assert.ok(choice.choiceType === 'chooseRoutDiscard');
      expect(choice.cardIds).toHaveLength(2);
    },
  );
});
