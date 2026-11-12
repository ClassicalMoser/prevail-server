import type { PlayerChoiceEvent } from '@classicalmoser/prevail-rules/domain';
import { getSeatChoice } from './get-seat-choice';
import type { GetSeatChoiceInput } from './get-seat-choice';

/**
 * The rules bot's choice for a seat, or undefined when the bot throws.
 *
 * Callers ask only for a seat that owes, so a throw is a bug (ADR 0003). It is
 * logged here, and the caller stops the bot instead of failing the human's
 * request or the step that asked.
 *
 * @param input - Authoritative state, the owing seat, and an optional random source.
 * @returns The bot's choice, or undefined when the rules bot threw.
 */
const trySeatChoice = (
  input: GetSeatChoiceInput,
): PlayerChoiceEvent | undefined => {
  try {
    const choice = getSeatChoice(input);
    return choice;
  } catch (error) {
    console.error('trySeatChoice: the rules bot threw', {
      error,
      seat: input.seat,
    });
    return undefined;
  }
};

export { trySeatChoice };
