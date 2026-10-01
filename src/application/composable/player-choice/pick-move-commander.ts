import { PLAYER_CHOICE_EVENT_TYPE } from '@classicalmoser/prevail-rules/domain';
import type {
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
  PlayerSide,
} from '@classicalmoser/prevail-rules/domain';
import type { RandomSource } from './random-source';
import { pickOne } from './pick-one';

const pickMoveCommander = (
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'moveCommander' }>,
  actingPlayer: PlayerSide,
  random: RandomSource,
): PlayerChoiceEvent | undefined => {
  const { startingCoordinate, destinations } = options;
  if (startingCoordinate === null) {
    return undefined;
  }
  const to = pickOne(destinations, random);
  if (to === undefined) {
    return undefined;
  }
  const choice: PlayerChoiceEvent = {
    choiceType: 'moveCommander',
    eventNumber: options.expectedEventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    from: startingCoordinate,
    player: actingPlayer,
    to,
  };
  return choice;
};

export { pickMoveCommander };
