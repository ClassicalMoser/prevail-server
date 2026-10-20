import assert from 'node:assert/strict';
import type { LegalPlayerChoiceOptions } from '@classicalmoser/prevail-rules/domain';
import {
  createEmptyGameState,
  tempCommandCards,
} from '@classicalmoser/prevail-rules/domain';
import type { RandomSource } from '@application/composable/player-choice/random-source';
import { sampleEitherSideChoice } from './sample-either-side-choice';

/** Always picks the first candidate (index 0). */
const firstAlways: RandomSource = {
  nextFloat: () => 0,
};

describe('sampleEitherSideChoice function', () => {
  it(
    'plays white when both sides still have a choose-card event',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const whiteCard = tempCommandCards[0];
      const blackCard = tempCommandCards[1];
      assert.ok(whiteCard !== undefined);
      assert.ok(blackCard !== undefined);

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

      const choice = sampleEitherSideChoice({
        options,
        random: firstAlways,
        state: createEmptyGameState('mini'),
      });

      expect(choice).toMatchObject({ player: 'white' });
    },
  );
});
