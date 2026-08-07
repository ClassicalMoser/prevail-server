import type { CommandCardStorage } from './command-card-storage-port';
import type { OwnedArmyStorage } from './owned-army-storage-port';
import type { UnitCardStorage } from './unit-card-storage-port';
import type { UserStorage } from './user-storage-port';

export interface StoragePort {
  commandCardStorage: CommandCardStorage;
  unitCardStorage: UnitCardStorage;
  ownedArmyStorage: OwnedArmyStorage;
  userStorage: UserStorage;
}
