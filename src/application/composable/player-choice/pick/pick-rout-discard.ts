import { PLAYER_CHOICE_EVENT_TYPE } from '@classicalmoser/prevail-rules/domain';
import type {
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import type { RandomSource } from '../random-source';
import { shuffleCopy } from '../shuffle-copy';

/**
 * Build a rout-discard choice by shuffling then taking the required count.
 *
 * Returns undefined when the prompt is for the other side or there are not
 * enough card ids to meet `numberToDiscard`.
 *
 * @param options - Legal rout-discard options from the rules kernel.
 * @param actingPlayer - Side making the discard.
 * @param random - Source of the shuffle.
 * @returns A choose-rout-discard event, or undefined when unpickable.
 */
const pickRoutDiscard = (
  options: Extract<
    LegalPlayerChoiceOptions,
    { choiceType: 'chooseRoutDiscard' }
  >,
  actingPlayer: PlayerSide,
  random: RandomSource,
): PlayerChoiceEvent | undefined => {
  const { routDiscard } = options;
  if (routDiscard.player !== actingPlayer) {
    return undefined;
  }
  if (routDiscard.cardIds.length < routDiscard.numberToDiscard) {
    return undefined;
  }
  const shuffledIds = shuffleCopy(routDiscard.cardIds, random);
  const cardIds = shuffledIds.slice(0, routDiscard.numberToDiscard);
  const choice: PlayerChoiceEvent = {
    cardIds,
    choiceType: 'chooseRoutDiscard',
    eventNumber: options.expectedEventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: actingPlayer,
  };
  return choice;
};

export { pickRoutDiscard };
