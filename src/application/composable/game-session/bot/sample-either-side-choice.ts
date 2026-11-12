import type {
  AuthoritativeGameState,
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
  RandomSource,
} from '@classicalmoser/prevail-rules/domain';
import { findOwingSeats } from './find-owing-seats';
import { trySeatChoice } from './try-seat-choice';

/** What `sampleEitherSideChoice` needs: the options that say who owes, and the state. */
interface SampleEitherSideChoiceInput {
  /** Legal options for the authoritative state; they say who owes. */
  options: LegalPlayerChoiceOptions;
  state: AuthoritativeGameState;
  random?: RandomSource;
}

/**
 * The rules bot's choice for the first seat that owes the current prompt.
 *
 * White goes first when both still owe a card, so the opening choose-card
 * prompt plays white on the first step and black on the next.
 *
 * @param input - Legal options, authoritative state, and an optional random source.
 * @returns One player-choice event, or undefined when no seat owes one or the bot threw.
 */
const sampleEitherSideChoice = (
  input: SampleEitherSideChoiceInput,
): PlayerChoiceEvent | undefined => {
  // No seat owing means nothing to play, and the rules bot throws for a seat that
  // owes nothing.
  const [seat] = findOwingSeats(input.options);
  if (seat === undefined) {
    return undefined;
  }
  const choice = trySeatChoice({
    random: input.random,
    seat,
    state: input.state,
  });
  return choice;
};

export type { SampleEitherSideChoiceInput };
export { sampleEitherSideChoice };
