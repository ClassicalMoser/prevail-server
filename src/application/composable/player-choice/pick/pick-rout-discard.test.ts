import assert from 'node:assert/strict';
import type {
  CommandCard,
  LegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import {
  createEmptyGameState,
  updatePlayerCardState,
} from '@classicalmoser/prevail-rules/domain';
import { tempCommandCards } from '@testing';
import { pickRoutDiscard } from './pick-rout-discard';

const firstAlways = {
  nextFloat: (): number => 0,
};

const hand: CommandCard[] = tempCommandCards.slice(0, 3);

/** Black holds the sample hand; the other side holds nothing. */
const state = updatePlayerCardState(createEmptyGameState('mini'), 'black', {
  awaitingPlay: null,
  burnt: [],
  discarded: [],
  inHand: hand,
  inPlay: null,
  played: [],
});

const options = (
  overrides: Partial<
    Extract<
      LegalPlayerChoiceOptions,
      { choiceType: 'chooseRoutDiscard' }
    >['routDiscard']
  > = {},
): Extract<LegalPlayerChoiceOptions, { choiceType: 'chooseRoutDiscard' }> => ({
  choiceType: 'chooseRoutDiscard',
  playerSource: 'black',
  routDiscard: {
    cardIds: hand.map((card) => card.id),
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
        state,
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
        options({
          cardIds: hand.slice(0, 1).map((card) => card.id),
          numberToDiscard: 2,
        }),
        'black',
        state,
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

      const choice = pickRoutDiscard(options(), 'black', state, firstAlways);

      assert.ok(choice !== undefined);
      assert.ok(choice.choiceType === 'chooseRoutDiscard');
      expect(choice.cards).toHaveLength(2);
    },
  );
});
