import type {
  ArmyWriteBody,
  EmptyObject,
} from '@classicalmoser/prevail-contracts';
import type { Army } from '@classicalmoser/prevail-rules/domain';
import type {
  DataErrorSignature,
  ErrorSignature,
  NoContentSignature,
} from '@ports/data-error-signature-port';

interface OwnedArmyUseCasesPort {
  getOwnedArmies: (ownerAuthSub: string) => Promise<DataErrorSignature<Army[]>>;
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
  ) => Promise<DataErrorSignature<EmptyObject>>;
  archiveOwnedArmy: (
    ownerAuthSub: string,
    armyId: string,
  ) => Promise<ErrorSignature | NoContentSignature>;
}

export type { OwnedArmyUseCasesPort };
