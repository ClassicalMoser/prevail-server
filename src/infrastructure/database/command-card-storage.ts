import type {
  CommandCard,
  CommandCardStorage,
  DataErrorSignature,
} from '@ports';
import { sql } from './sql';

const createCommandCardStorage = async (): Promise<CommandCardStorage> => {
  const resultPromise = sql`SELECT * FROM command_cards`;
  return {
    getCommandCards: async () => {
      const result = await resultPromise;
      return {
        success: true,
        data: result as unknown as CommandCard[],
      } as DataErrorSignature<CommandCard[]>;
    },
  };
};

export { createCommandCardStorage };
