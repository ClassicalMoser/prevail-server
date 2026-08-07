import type { ArmyWriteBody, EmptyObject } from '@classicalmoser/prevail-contracts';
import type { Army } from '@classicalmoser/prevail-rules/domain';
import type {
  DataErrorSignature,
  ErrorSignature,
  NoContentSignature,
  OwnedArmyStorage,
  OwnedArmyUseCasesPort,
} from '@ports';
import { noContentSuccess } from '@ports';

interface OwnedArmyUseCasesDeps {
  ownedArmyStorage: OwnedArmyStorage;
}

const emptyObjectSuccess = (): DataErrorSignature<EmptyObject> => ({
  success: true,
  data: {},
});

const createOwnedArmyUseCases = (
  deps: OwnedArmyUseCasesDeps,
): OwnedArmyUseCasesPort => ({
  getOwnedArmies: async (
    ownerAuthSub: string,
  ): Promise<DataErrorSignature<Army[]>> =>
    deps.ownedArmyStorage.getOwnedArmies(ownerAuthSub),

  getOwnedArmyById: async (
    ownerAuthSub: string,
    armyId: string,
  ): Promise<DataErrorSignature<Army>> =>
    deps.ownedArmyStorage.getOwnedArmyById(ownerAuthSub, armyId),

  createOwnedArmy: async (
    ownerAuthSub: string,
  ): Promise<DataErrorSignature<string>> =>
    deps.ownedArmyStorage.createOwnedArmy(ownerAuthSub),

  updateOwnedArmy: async (
    ownerAuthSub: string,
    armyId: string,
    body: ArmyWriteBody,
  ): Promise<DataErrorSignature<EmptyObject>> => {
    const result = await deps.ownedArmyStorage.updateOwnedArmy(
      ownerAuthSub,
      armyId,
      body,
    );
    if (!result.success) {
      return result;
    }
    return emptyObjectSuccess();
  },

  archiveOwnedArmy: async (
    ownerAuthSub: string,
    armyId: string,
  ): Promise<ErrorSignature | NoContentSignature> => {
    const result = await deps.ownedArmyStorage.archiveOwnedArmy(
      ownerAuthSub,
      armyId,
    );
    if (!result.success) {
      return result;
    }
    return noContentSuccess();
  },
});

export type { OwnedArmyUseCasesDeps };
export { createOwnedArmyUseCases };
