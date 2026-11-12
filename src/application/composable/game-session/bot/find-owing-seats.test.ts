import assert from 'node:assert/strict';
import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import { tempCommandCards } from '@testing';
import { findOwingSeats } from './find-owing-seats';

const card = tempCommandCards[0];

describe('findOwingSeats function', () => {
  it('names the one side the rules name', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const options: LegalPlayerChoiceOptions = {
      choiceType: 'doneIssuingCommands',
      events: [],
      playerSource: 'black',
    };

    expect(findOwingSeats(options)).toStrictEqual(['black']);
  });

  it('leaves out a seat whose card is already down', { timeout: 5000 }, () => {
    expect.hasAssertions();

    assert.ok(card !== undefined);
    // White has laid its card, so only black's card events remain.
    const options: LegalPlayerChoiceOptions = {
      choiceType: 'chooseCard',
      events: [
        {
          card,
          choiceType: 'chooseCard',
          eventType: 'playerChoice',
          player: 'black',
        },
      ],
      playerSource: 'bothPlayers',
    };

    expect(findOwingSeats(options)).toStrictEqual(['black']);
  });
});
