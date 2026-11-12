import {
  defaultBotTemperament,
  getBotChoice,
} from '@classicalmoser/prevail-rules/bot';
import {
  defaultRandom,
  projectGameStateForVisibility,
} from '@classicalmoser/prevail-rules/domain';
import type {
  AuthoritativeGameState,
  PlayerChoiceEvent,
  PlayerSide,
  RandomSource,
} from '@classicalmoser/prevail-rules/domain';

interface GetSeatChoiceInput {
  /** The authoritative state. The bot is shown only its seat's view of it. */
  state: AuthoritativeGameState;
  /** The side the bot plays. It must owe the current choice. */
  seat: PlayerSide;
  /** Where its whims come from. Tests pass a fixed source. */
  random?: RandomSource;
}

/**
 * The rules bot's choice for a seat that owes one.
 *
 * The decision itself lives in `prevail-rules/bot`. The server only hands it
 * the seat's projected view, so the bot cannot read the opponent's hand, and
 * plays it with the default temperament. Ask only for a seat that
 * `findOwingSeats` names: the rules bot throws when its seat owes nothing.
 *
 * @param input - Authoritative state, the owing seat, and an optional random source.
 * @returns The bot's choice.
 * @throws When the seat owes no choice.
 */
const getSeatChoice = (input: GetSeatChoiceInput): PlayerChoiceEvent => {
  const { state, seat } = input;
  const random = input.random ?? defaultRandom;
  // A seat sees the board and its own hand, the same as a human client would.
  const visibility = seat === 'white' ? 'whiteSeen' : 'blackSeen';
  const view = projectGameStateForVisibility(state, visibility);
  const choice = getBotChoice(view, seat, defaultBotTemperament, random);
  return choice;
};

export type { GetSeatChoiceInput };
export { getSeatChoice };
