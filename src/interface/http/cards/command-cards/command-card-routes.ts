import { cardSchema } from '@classicalmoser/prevail-rules/domain';
import type { Card } from '@classicalmoser/prevail-rules/domain';
import type {
  CommandCardUseCasesPort,
  DataErrorSignature,
  GetRouteRequest,
  ImplementedGetRoute,
  ImplementedPostRoute,
  RouteRegistry,
  RouteRequest,
  WireRouteRequest,
} from '@ports';
import {
  defineGetRoute,
  definePostRoute,
  parseUnknownGetRequest,
  parseUnknownPostRequest,
} from '@interface/http/route-definitions';

/** Query params for GET /cards/command/current-versions. */
interface CurrentVersionsQuery {
  rulesVersion: string;
}

const isCurrentVersionsQuery = (
  query: unknown,
): query is CurrentVersionsQuery =>
  typeof query === 'object' &&
  query !== null &&
  'rulesVersion' in query &&
  typeof query.rulesVersion === 'string';

/** Validates and narrows the `rulesVersion` query param before the handler runs. */
const parseCurrentVersionsQuery = (
  wire: WireRouteRequest,
): GetRouteRequest<unknown, CurrentVersionsQuery> => {
  if (!isCurrentVersionsQuery(wire.query)) {
    throw new Error('Invalid query: rulesVersion is required');
  }

  return {
    params: wire.params,
    query: wire.query,
    headers: wire.headers,
  };
};

/** Validates the request body against the domain card schema before the handler runs. */
const parseCardPostRequest = (
  wire: WireRouteRequest,
): RouteRequest<unknown, unknown, Card> => {
  const parsed = cardSchema.safeParse(wire.body);
  if (!parsed.success) {
    throw new Error('Invalid card body');
  }

  return {
    params: wire.params,
    query: wire.query,
    body: parsed.data,
    headers: wire.headers,
  };
};

/** Command card HTTP routes, registered via {@link defineGetRoute} / {@link definePostRoute}. */
const createCommandCardRoutes = (
  commandCardUseCases: CommandCardUseCasesPort,
): RouteRegistry => [
  defineGetRoute(
    {
      method: 'GET',
      path: '/cards/command/current-versions',
      auth: { authRequired: false },
      handler: async (request): Promise<DataErrorSignature<Card[]>> =>
        commandCardUseCases.getCurrentCommandCardVersionsByRulesVersion(
          request.query.rulesVersion,
        ),
      // `satisfies` checks the handler against the contract without widening inferred types.
    } satisfies ImplementedGetRoute<unknown, CurrentVersionsQuery, Card[]>,
    parseCurrentVersionsQuery,
  ),
  definePostRoute(
    {
      method: 'POST',
      path: '/cards/command/create-empty',
      auth: {
        authRequired: true,
        permissionsRequired: ['cards:create-version'],
      },
      handler: async (): Promise<DataErrorSignature<string>> =>
        commandCardUseCases.createEmptyCommandCard(),
    } satisfies ImplementedPostRoute<unknown, unknown, unknown, string>,
    parseUnknownPostRequest,
  ),
  definePostRoute(
    {
      method: 'POST',
      path: '/cards/command/write-version',
      auth: {
        authRequired: true,
        permissionsRequired: ['cards:create-version'],
      },
      handler: async (request): Promise<DataErrorSignature<Card>> =>
        commandCardUseCases.writeCommandCardVersion(request.body),
    } satisfies ImplementedPostRoute<unknown, unknown, Card, Card>,
    parseCardPostRequest,
  ),
  defineGetRoute(
    {
      method: 'GET',
      path: '/cards/command/all-versions',
      auth: { authRequired: false },
      handler: async (): Promise<DataErrorSignature<Card[]>> =>
        commandCardUseCases.getAllCommandCardVersions(),
    } satisfies ImplementedGetRoute<unknown, unknown, Card[]>,
    parseUnknownGetRequest,
  ),
];

export { createCommandCardRoutes };
