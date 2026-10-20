import type {
  GameState,
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import { selectRandomPlayerChoice } from '@application/composable/player-choice/select-random-player-choice';
import type { RandomSource } from '@application/composable/player-choice/random-source';

interface SampleEitherSideChoiceInput {
  options: LegalPlayerChoiceOptions;
  state: GameState;
  random?: RandomSource;
}

/**
 * Sides that may still answer this prompt, white first.
 *
 * A single-side prompt is only that side. `bothPlayers` tries white, then
 * black, so the opening choose-card prompt plays white on the first step.
 *
 * @param playerSource - Who the rules say may choose.
 * @returns The sides to sample, in step order.
 */
const sidesForPrompt = (
  playerSource: LegalPlayerChoiceOptions['playerSource'],
): readonly PlayerSide[] => {
  if (playerSource === 'bothPlayers') {
    const both: readonly PlayerSide[] = ['white', 'black'];
    return both;
  }
  const only: readonly PlayerSide[] = [playerSource];
  return only;
};

/**
 * Sample one legal choice for the side this prompt belongs to.
 *
 * White is preferred when both sides still have a choice. An empty result
 * means the selector had nothing legal for those sides.
 *
 * @param input - Legal options, authoritative state, and an optional random source.
 * @returns One player-choice event, or undefined when nothing can be sampled.
 */
const sampleEitherSideChoice = (
  input: SampleEitherSideChoiceInput,
): PlayerChoiceEvent | undefined => {
  const sides = sidesForPrompt(input.options.playerSource);
  for (const actingPlayer of sides) {
    const choice = selectRandomPlayerChoice({
      actingPlayer,
      options: input.options,
      random: input.random,
      state: input.state,
    });
    if (choice !== undefined) {
      return choice;
    }
  }
  return undefined;
};

export type { SampleEitherSideChoiceInput };
export { sampleEitherSideChoice };
