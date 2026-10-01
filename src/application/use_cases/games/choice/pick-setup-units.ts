import { PLAYER_CHOICE_EVENT_TYPE } from '@classicalmoser/prevail-rules/domain';
import type {
  LegalPlayerChoiceOptions,
  PlayerChoiceEvent,
  PlayerSide,
  UnitWithPlacement,
} from '@classicalmoser/prevail-rules/domain';
import type { RandomSource } from './random-source';
import { shuffleCopy } from './shuffle-copy';

const setupFacing = (player: PlayerSide): 'north' | 'south' => {
  const facing = player === 'white' ? 'south' : 'north';
  return facing;
};

/**
 * Place the acting player's setup units on a random subset of legal coordinates.
 *
 * The facing is south for white and north for black. The commander's
 * coordinate is the first placement. Too few coordinates, or an empty unit
 * list, returns undefined so the bot does not submit an illegal setup.
 */
const pickSetupUnits = (
  options: Extract<LegalPlayerChoiceOptions, { choiceType: 'setupUnits' }>,
  actingPlayer: PlayerSide,
  random: RandomSource,
): PlayerChoiceEvent | undefined => {
  const { setupUnits } = options;
  if (setupUnits.player !== actingPlayer) {
    return undefined;
  }
  if (
    setupUnits.units.length === 0 ||
    setupUnits.coordinates.length < setupUnits.units.length
  ) {
    return undefined;
  }
  const shuffledCoordinates = shuffleCopy(setupUnits.coordinates, random);
  const coordinates = shuffledCoordinates.slice(0, setupUnits.units.length);
  const facing = setupFacing(actingPlayer);
  const unitPlacements: UnitWithPlacement[] = setupUnits.units.map(
    (unit, index) => {
      const coordinate = coordinates[index];
      const placement: UnitWithPlacement = {
        placement: {
          coordinate,
          facing,
        },
        unit,
      };
      return placement;
    },
  );
  const commanderCoordinate = unitPlacements[0]?.placement.coordinate;
  if (commanderCoordinate === undefined) {
    return undefined;
  }
  const choice: PlayerChoiceEvent = {
    choiceType: 'setupUnits',
    commanderCoordinate,
    eventNumber: options.expectedEventNumber,
    eventType: PLAYER_CHOICE_EVENT_TYPE,
    player: actingPlayer,
    unitPlacements,
  };
  return choice;
};

export { pickSetupUnits };
