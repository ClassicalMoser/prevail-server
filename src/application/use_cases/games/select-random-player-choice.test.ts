import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import {
  createEmptyGameState,
  tempCommandCards,
} from '@classicalmoser/prevail-rules/domain';
import { selectRandomPlayerChoice } from './select-random-player-choice';
import type { RandomSource } from './select-random-player-choice';

/** Always picks the first candidate (index 0). */
const firstAlways: RandomSource = {
  nextFloat: () => 0,
};

describe(selectRandomPlayerChoice, () => {
  it('picks an event for the acting player from a list choice', () => {
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

    const choice = selectRandomPlayerChoice(
      options,
      createEmptyGameState('mini'),
      'black',
      firstAlways,
    );

    expect(choice).toMatchObject({
      choiceType: 'chooseWhetherToRetreat',
      choosesToRetreat: false,
      eventNumber: 3,
      player: 'black',
    });
  });

  it('ignores peer events when bothPlayers still choose', () => {
    expect.hasAssertions();

    const whiteCard = tempCommandCards[0];
    const blackCard = tempCommandCards[1];
    if (whiteCard === undefined || blackCard === undefined) {
      throw new Error('Expected sample command cards');
    }

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

    const choice = selectRandomPlayerChoice(
      options,
      createEmptyGameState('mini'),
      'black',
      firstAlways,
    );

    expect(choice).toMatchObject({
      card: { id: blackCard.id },
      player: 'black',
    });
  });

  it('returns null when the acting seat has no options', () => {
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
      selectRandomPlayerChoice(
        options,
        createEmptyGameState('mini'),
        'black',
        firstAlways,
      ),
    ).toBeNull();
  });

  it('builds a rout-discard choice from card atoms', () => {
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

    const choice = selectRandomPlayerChoice(
      options,
      createEmptyGameState('mini'),
      'black',
      firstAlways,
    );

    expect(choice?.choiceType).toBe('chooseRoutDiscard');
    expect(choice?.player).toBe('black');
    if (choice?.choiceType !== 'chooseRoutDiscard') {
      throw new Error('Expected chooseRoutDiscard');
    }
    expect(choice.cardIds).toHaveLength(2);
    expect(new Set(choice.cardIds).size).toBe(2);
    expect(
      choice.cardIds.every((id) => ['a', 'b', 'c'].includes(id)),
    ).toBe(true);
  });
});
