import type { PlayerSide } from '@classicalmoser/prevail-rules/domain';
import type { RandomSource } from './random-source';
import { pickOne } from './pick-one';

const pickEventForPlayer = <T extends { player: PlayerSide }>(
  events: readonly T[],
  actingPlayer: PlayerSide,
  random: RandomSource,
): T | undefined => {
  const matching = events.filter((event) => event.player === actingPlayer);
  const event = pickOne(matching, random);
  return event;
};

export { pickEventForPlayer };
