import type {
  CommandCardStorage,
  DataErrorSignature,
  CommandCard,
} from '@ports';

export const getCommandCards = async (
  commandCardStorage: CommandCardStorage,
): Promise<DataErrorSignature<CommandCard[]>> =>
  commandCardStorage.getCommandCards();
