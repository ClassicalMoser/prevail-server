import {
  PLAYER_CHOICE_EVENT_TYPE,
  findOwnedPlayerCardState,
} from '@classicalmoser/prevail-rules/domain';
import type {
  GameState,
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
 * @param state - Current state, read for the cards in the discarding hand.
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
  state: GameState,
  random: RandomSource,
): PlayerChoiceEvent | undefined => {
  const { routDiscard } = options;
  if (routDiscard.player !== actingPlayer) {
    return undefined;
  }
  if (routDiscard.cardIds.length < routDiscard.numberToDiscard) {
    return undefined;
  }
  const hand = findOwnedPlayerCardState(state.cardState, actingPlayer)?.inHand;
  if (hand === undefined) {
    return undefined;
  }
  const legal = hand.filter((card) => routDiscard.cardIds.includes(card.id));
  if (legal.length < routDiscard.numberToDiscard) {
    return undefined;
  }
  const cards = shuffleCopy(legal, random).slice(
    0,
    routDiscard.numberToDiscard,
  );
  const choice: PlayerChoiceEvent = {
    cards,
    choiceType: 'chooseRoutDiscard',
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: actingPlayer,
  };
  return choice;
};

export { pickRoutDiscard };
