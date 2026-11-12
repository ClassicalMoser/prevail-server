import { createInitialGameState } from '@classicalmoser/prevail-rules/domain';
import {
  blackMiniStarterArmy,
  whiteMiniStarterArmy,
} from '@classicalmoser/prevail-rules/sampleValues';
import { getSeatChoice } from './get-seat-choice';

/** A fresh mini game. It opens with white owing its setup. */
const openingState = createInitialGameState({
  blackArmy: blackMiniStarterArmy,
  gameMode: 'mini',
  whiteArmy: whiteMiniStarterArmy,
});

describe('getSeatChoice function', () => {
  it('sets up white, the seat that owes it', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // White owes the opening setup, so white's seat gets a setupUnits choice.
    const choice = getSeatChoice({ seat: 'white', state: openingState });

    expect(choice).toMatchObject({ choiceType: 'setupUnits', player: 'white' });
  });

  it('throws for a seat that owes nothing', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // Black owes nothing at the opening; asking the bot to play for it is a caller bug and throws.
    expect(() => getSeatChoice({ seat: 'black', state: openingState })).toThrow(
      'black was asked for setupUnits, which white owes',
    );
  });
});
