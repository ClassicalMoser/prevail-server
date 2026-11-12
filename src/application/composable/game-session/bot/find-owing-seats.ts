import type {
  LegalPlayerChoiceOptions,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';

/**
 * The seats that owe the current choice, white first.
 *
 * Usually the rules name one side. When both choose cards at once, a seat
 * whose card is already down owes nothing more. The authoritative options
 * still list a card event for each seat holding one, so their players are the
 * seats that still owe. Pass options read from the authoritative state, not
 * a seat view, or the other seat's hand is missing.
 *
 * @param options - Legal options for the authoritative state.
 * @returns Owing seats in step order. Empty when no seat can answer.
 */
const findOwingSeats = (
  options: LegalPlayerChoiceOptions,
): readonly PlayerSide[] => {
  if (options.playerSource !== 'bothPlayers') {
    const only: readonly PlayerSide[] = [options.playerSource];
    return only;
  }
  // Only card choices are made by both sides at once.
  if (options.choiceType !== 'chooseCard') {
    const none: readonly PlayerSide[] = [];
    return none;
  }
  const holding = new Set(options.events.map((event) => event.player));
  const sides: readonly PlayerSide[] = ['white', 'black'];
  const owing = sides.filter((side) => holding.has(side));
  return owing;
};

export { findOwingSeats };
