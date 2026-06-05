import type { Card } from '@classicalmoser/prevail-rules/domain';
import type {
  CommandCardUseCasesPort,
  DataErrorSignature,
  RouteDefinition,
  RouteRegistry,
} from '@ports';

interface CurrentVersionsQuery {
  rulesVersion: string;
}

const createCommandCardRoutes = (
  commandCardUseCases: CommandCardUseCasesPort,
): RouteRegistry => [
  {
    method: 'GET',
    url: '/cards/command/current-versions',
    handler: async (request): Promise<DataErrorSignature<Card[]>> =>
      commandCardUseCases.getCurrentCommandCardVersionsByRulesVersion(
        request.query.rulesVersion,
      ),
  } satisfies RouteDefinition<
    unknown,
    unknown,
    CurrentVersionsQuery,
    DataErrorSignature<Card[]>
  >,
];

export { createCommandCardRoutes };
