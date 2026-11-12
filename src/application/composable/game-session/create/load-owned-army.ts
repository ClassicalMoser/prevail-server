import type { Army } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature, ErrorSignature } from '@ports';
import type { GameSessionStore } from '../session/game-session-store';

/**
 * Load one army for a new game, and only if the creating subject owns it.
 *
 * A game is built from armies the creator saved themselves: the owned-army
 * lookup is keyed by subject, so another player's army id comes back as not
 * found. The caller says how a failed lookup is worded, because a human-vs-bot
 * create and a bot-vs-bot create name the armies differently.
 *
 * @param store - Live-game memory, which holds the owned-army port.
 * @param subject - Auth subject of the creating player.
 * @param armyId - The army the creator picked for this side.
 * @param describeFailure - Turns the storage failure into the envelope create returns.
 * @returns The army, or the caller's failure envelope.
 */
const loadOwnedArmy = async (
  store: GameSessionStore,
  subject: string,
  armyId: string,
  describeFailure: (failure: ErrorSignature) => ErrorSignature,
): Promise<DataErrorSignature<Army>> => {
  const owned = await store.ownedArmyStorage.getOwnedArmyById(subject, armyId);
  if (!owned.success) {
    const failure = describeFailure(owned);
    return failure;
  }
  return owned;
};

export { loadOwnedArmy };
