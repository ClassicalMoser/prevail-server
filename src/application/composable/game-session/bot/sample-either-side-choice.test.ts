import assert from 'node:assert/strict';
import {
  createInitialGameState,
  getLegalPlayerChoiceOptions,
} from '@classicalmoser/prevail-rules/domain';
import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import {
  blackMiniStarterArmy,
  whiteMiniStarterArmy,
} from '@classicalmoser/prevail-rules/sampleValues';
import { sampleEitherSideChoice } from './sample-either-side-choice';

/** A fresh mini game. It opens with white owing its setup. */
const openingState = createInitialGameState({
  blackArmy: blackMiniStarterArmy,
  gameMode: 'mini',
  whiteArmy: whiteMiniStarterArmy,
});

describe('sampleEitherSideChoice function', () => {
  it(
    'answers the opening setup for white, the side that owes it',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const options = getLegalPlayerChoiceOptions(openingState);
      assert.ok(options !== null);

      const choice = sampleEitherSideChoice({ options, state: openingState });

      expect(choice).toMatchObject({
        choiceType: 'setupUnits',
        player: 'white',
      });
    },
  );

  it(
    'returns undefined when both sides have laid their cards',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // A card prompt with no card events left: no seat still owes.
      const allDown: LegalPlayerChoiceOptions = {
        choiceType: 'chooseCard',
        events: [],
        playerSource: 'bothPlayers',
      };

      const choice = sampleEitherSideChoice({
        options: allDown,
        state: openingState,
      });

      expect(choice).toBeUndefined();
    },
  );
});
