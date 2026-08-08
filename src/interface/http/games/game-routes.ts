import { createVsBotGameContract } from '@classicalmoser/prevail-contracts';
import type {
  GameSessionUseCasesPort,
  LoggerPort,
  RouteRegistry,
} from '@ports';
import { implementPostRoute } from '../route-definitions';

const missingAuth = {
  message: 'Unauthorized',
  status: 401,
  success: false as const,
};

const createGameRoutes = (
  gameSessionUseCases: GameSessionUseCasesPort,
  logger: LoggerPort,
): RouteRegistry => [
  implementPostRoute(createVsBotGameContract, logger, {
    handler: async (request, auth) => {
      if (auth === undefined) {
        return missingAuth;
      }
      return gameSessionUseCases.createVsBotGame(auth.subject, request.body);
    },
  }),
];

export { createGameRoutes };
