import type { PlayerSide } from '@classicalmoser/prevail-rules/domain';
import type { RandomSource } from '../random-source';
import { pickOne } from '../pick-one';

/**
 * Pick one event that belongs to the acting player.
 *
 * Used when a rules prompt lists events for both sides and the bot (or
 * auto-resolver) must choose among only its own entries.
 *
 * @param events - Candidate events that carry a `player` field.
 * @param actingPlayer - Side whose events are eligible.
 * @param random - Source of the uniform draw.
 * @returns One matching event, or undefined when none match.
 */
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
