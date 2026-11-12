import type {
  ArmyWriteBody,
  EmptyObject,
} from '@classicalmoser/prevail-contracts';
import type { Army } from '@classicalmoser/prevail-rules/domain';
import { UNTITLED_ARMY_NAME } from '@domain';
import type {
  DataErrorSignature,
  ErrorSignature,
  NoContentSignature,
  OwnedArmyStorage,
  OwnedArmyUseCasesPort,
} from '@ports';
import { mapVoidToEmptyObject, mapVoidToNoContent } from '@ports';

/** The storage the army use cases run on. */
interface OwnedArmyUseCasesDeps {
  ownedArmyStorage: OwnedArmyStorage;
}

/**
 * Owned-army use cases.
 *
 * Reads delegate to storage. Create stores the untitled display name.
 * Update stores the name the client sent with the composition and returns
 * an empty object so the HTTP contract can answer 200.
 * Archive maps a void write to 204.
 *
 * @param deps - Owned-army storage.
 * @returns The owned-army use-case port.
 */
const createOwnedArmyUseCases = (
  deps: OwnedArmyUseCasesDeps,
): OwnedArmyUseCasesPort => ({
  getOwnedArmies: async (
    ownerAuthSub: string,
  ): Promise<DataErrorSignature<Army[]>> => {
    // Scoped by owner: a player sees only their own armies.
    const armies = await deps.ownedArmyStorage.getOwnedArmies(ownerAuthSub);
    return armies;
  },

  getOwnedArmyById: async (
    ownerAuthSub: string,
    armyId: string,
  ): Promise<DataErrorSignature<Army>> => {
    const army = await deps.ownedArmyStorage.getOwnedArmyById(
      ownerAuthSub,
      armyId,
    );
    return army;
  },

  createOwnedArmy: async (
    ownerAuthSub: string,
  ): Promise<DataErrorSignature<string>> => {
    // A new army starts untitled so the builder has a row to save into at once.
    const armyId = await deps.ownedArmyStorage.createOwnedArmy(
      ownerAuthSub,
      UNTITLED_ARMY_NAME,
    );
    return armyId;
  },

  updateOwnedArmy: async (
    ownerAuthSub: string,
    armyId: string,
    body: ArmyWriteBody,
  ): Promise<DataErrorSignature<EmptyObject>> => {
    // The client sends a whole army each save; map the contract's field names
    // onto the storage write.
    const write = {
      armyName: body.name,
      units: body.units,
      commandCards: body.commandCards,
    };
    const updated = await deps.ownedArmyStorage.updateOwnedArmy(
      ownerAuthSub,
      armyId,
      write,
    );
    const result = mapVoidToEmptyObject(updated);
    return result;
  },

  archiveOwnedArmy: async (
    ownerAuthSub: string,
    armyId: string,
  ): Promise<ErrorSignature | NoContentSignature> => {
    // A player removes an army from their list by archiving it (a soft delete);
    // storage rejects later edits to an archived army.
    // TODO(composition): confirm whether archived armies stay referenced by past games.
    const archived = await deps.ownedArmyStorage.archiveOwnedArmy(
      ownerAuthSub,
      armyId,
    );
    const result = mapVoidToNoContent(archived);
    return result;
  },
});

export type { OwnedArmyUseCasesDeps };
export { createOwnedArmyUseCases };
