import type {
  ArmyWriteBody,
  EmptyObject,
} from '@classicalmoser/prevail-contracts';
import type { Army } from '@classicalmoser/prevail-rules/domain';
import { UNTITLED_ARMY_NAME, armyDisplayName } from '@domain';
import type {
  DataErrorSignature,
  ErrorSignature,
  NoContentSignature,
  OwnedArmyStorage,
  OwnedArmyUseCasesPort,
} from '@ports';
import { mapVoidToEmptyObject, mapVoidToNoContent } from '@ports';

interface OwnedArmyUseCasesDeps {
  ownedArmyStorage: OwnedArmyStorage;
}

const createOwnedArmyUseCases = (
  deps: OwnedArmyUseCasesDeps,
): OwnedArmyUseCasesPort => ({
  getOwnedArmies: async (
    ownerAuthSub: string,
  ): Promise<DataErrorSignature<Army[]>> => {
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
    const write = {
      armyName: armyDisplayName(body.units),
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
