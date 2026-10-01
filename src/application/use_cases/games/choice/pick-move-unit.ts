import {
  PLAYER_CHOICE_EVENT_TYPE,
  getLegalUnitMoves,
} from '@classicalmoser/prevail-rules/domain';
import type {
  GameState,
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
  PlayerSide,
  UnitWithPlacement,
} from '@classicalmoser/prevail-rules/domain';
import type { RandomSource } from './random-source';
import { pickOne } from './pick-one';
import { shuffleCopy } from './shuffle-copy';

const pickMoveUnit = (input: {
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'moveUnit' }>;
  actingPlayer: PlayerSide;
  state: GameState;
  random: RandomSource;
}): PlayerChoiceEvent | undefined => {
  const { options, actingPlayer, state, random } = input;
  const { moveUnits } = options;
  if (moveUnits.player !== actingPlayer) {
    return undefined;
  }

  const match = shuffleCopy([...moveUnits.units], random)
    .map((unit) => {
      try {
        const destinations = [...getLegalUnitMoves(unit, state)];
        const move: {
          destinations: UnitWithPlacement['placement'][];
          unit: (typeof moveUnits.units)[number];
        } = { destinations, unit };
        return move;
      } catch {
        const destinations: UnitWithPlacement['placement'][] = [];
        const move: {
          destinations: UnitWithPlacement['placement'][];
          unit: (typeof moveUnits.units)[number];
        } = { destinations, unit };
        return move;
      }
    })
    .map(({ destinations, unit }) => {
      const option = { to: pickOne(destinations, random), unit };
      return option;
    })
    .find((entry) => entry.to !== undefined);

  if (match?.to === undefined) {
    return undefined;
  }

  const choice: PlayerChoiceEvent = {
    choiceType: 'moveUnit',
    eventNumber: options.expectedEventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    moveCommander: false,
    player: actingPlayer,
    to: match.to,
    unit: match.unit,
  };
  return choice;
};

export { pickMoveUnit };
