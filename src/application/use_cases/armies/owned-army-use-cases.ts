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
    deps.ownedArmyStorage.createOwnedArmy(ownerAuthSub, UNTITLED_ARMY_NAME),

  updateOwnedArmy: async (
    ownerAuthSub: string,
    armyId: string,
    body: ArmyWriteBody,
  ): Promise<DataErrorSignature<EmptyObject>> =>
    mapVoidToEmptyObject(
      await deps.ownedArmyStorage.updateOwnedArmy(ownerAuthSub, armyId, {
        armyName: armyDisplayName(body.units),
        units: body.units,
        commandCards: body.commandCards,
      }),
    ),

  archiveOwnedArmy: async (
    ownerAuthSub: string,
    armyId: string,
  ): Promise<ErrorSignature | NoContentSignature> =>
    mapVoidToNoContent(
      await deps.ownedArmyStorage.archiveOwnedArmy(ownerAuthSub, armyId),
    ),
});

export type { OwnedArmyUseCasesDeps };
export { createOwnedArmyUseCases };
