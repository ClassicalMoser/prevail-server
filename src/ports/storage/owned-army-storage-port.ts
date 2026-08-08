import type { Army } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports/data-error-signature-port';

/** Write model for updating an owned army, including display name. */
interface OwnedArmyWrite {
  armyName: string;
  units: Army['units'];
  commandCards: Army['commandCards'];
}

/**
 * Persistence for player-owned armies.
 *
 * Armies are scoped to an owner auth subject. Soft-archive hides an army
 * without deleting composition history. Storage assigns the army id on create.
 */
interface OwnedArmyStorage {
  getOwnedArmies: (ownerAuthSub: string) => Promise<DataErrorSignature<Army[]>>;
  getOwnedArmyById: (
    ownerAuthSub: string,
    armyId: string,
  ) => Promise<DataErrorSignature<Army>>;
  createOwnedArmy: (
    ownerAuthSub: string,
    armyName: string,
  ) => Promise<DataErrorSignature<string>>;
  updateOwnedArmy: (
    ownerAuthSub: string,
    armyId: string,
    write: OwnedArmyWrite,
  ) => Promise<DataErrorSignature<void>>;
  archiveOwnedArmy: (
    ownerAuthSub: string,
    armyId: string,
  ) => Promise<DataErrorSignature<void>>;
}

export type { OwnedArmyStorage, OwnedArmyWrite };
