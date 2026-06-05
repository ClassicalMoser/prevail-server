import type { CommandCardStorage, DataErrorSignature } from '@ports';
import type { Card } from '@classicalmoser/prevail-rules/domain';

export const getAllCommandCards = async (
  commandCardStorage: CommandCardStorage,
  rulesVersion: string,
): Promise<DataErrorSignature<Card[]>> =>
  commandCardStorage.getCurrentCommandCardVersionsByRulesVersion(rulesVersion);
