import { PLAYER_CHOICE_EVENT_TYPE } from '@classicalmoser/prevail-rules/domain';
import type {
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import type { RandomSource } from './random-source';
import { shuffleCopy } from './shuffle-copy';

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
