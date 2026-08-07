import type { ArmyWriteBody } from '@classicalmoser/prevail-contracts';
import type { Army } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports/data-error-signature-port';

/**
 * Persistence for player-owned armies.
 *
 * Tables: `armies`, `army_unit_cards`, `army_command_cards`, joined to
 * `users` via `user_auth_sub`. Soft-archive via `armies.archived_at`.
 * Army id is assigned by storage on create (`gen_random_uuid()`).
 */
interface OwnedArmyStorage {
  getOwnedArmies: (
    ownerAuthSub: string,
  ) => Promise<DataErrorSignature<Army[]>>;
  getOwnedArmyById: (
    ownerAuthSub: string,
    armyId: string,
  ) => Promise<DataErrorSignature<Army>>;
  createOwnedArmy: (
    ownerAuthSub: string,
  ) => Promise<DataErrorSignature<string>>;
  updateOwnedArmy: (
    ownerAuthSub: string,
    armyId: string,
    body: ArmyWriteBody,
  ) => Promise<DataErrorSignature<void>>;
  archiveOwnedArmy: (
    ownerAuthSub: string,
    armyId: string,
  ) => Promise<DataErrorSignature<void>>;
}

export type { OwnedArmyStorage };
