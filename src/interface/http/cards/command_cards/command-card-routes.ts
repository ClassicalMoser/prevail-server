import { getCommandCards } from '@application';
import type {
  CommandCard,
  CommandCardStorage,
  DataErrorSignature,
  RouteDefinition,
} from '@ports';

const createCommandCardRoutes = (
  commandCardStorage: CommandCardStorage,
): RouteDefinition[] => [
  {
    method: 'GET',
    url: '/cards/command',
    handler: (): Promise<DataErrorSignature<CommandCard[]>> =>
      getCommandCards(commandCardStorage),
  },
];

export { createCommandCardRoutes };
