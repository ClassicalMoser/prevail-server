import type { CommandCardStorage } from './command-card-storage-port';
import type { UnitCardStorage } from './unit-card-storage-port';

export interface StoragePort {
  commandCardStorage: CommandCardStorage;
  unitCardStorage: UnitCardStorage;
}
