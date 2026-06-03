import type { DataErrorSignature } from './data-error-signature-port';

interface CommandCard {
  id: string;
  createdAt: Date;
}

interface CommandCardStorage {
  getCommandCards: () => Promise<DataErrorSignature<CommandCard[]>>;
}

export type { CommandCard, CommandCardStorage };
