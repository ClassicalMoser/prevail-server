import {
  archiveOwnedArmyContract,
  createOwnedArmyContract,
  getOwnedArmiesContract,
  getOwnedArmyByIdContract,
  updateOwnedArmyContract,
} from '@classicalmoser/prevail-contracts/contracts';
import type {
  LoggerPort,
  OwnedArmyUseCasesPort,
  RouteRegistry,
} from '@ports';
import {
  implementDeleteRoute,
  implementGetRoute,
  implementPostRoute,
  implementPutRoute,
} from '@interface/http/route-definitions';

const missingAuth = {
  success: false as const,
  message: 'Unauthorized',
  status: 401,
};

const requireSubject = (auth: { subject: string } | undefined) => {
  if (auth === undefined) {
    return undefined;
  }
  return auth.subject;
};

const createOwnedArmyRoutes = (
  ownedArmyUseCases: OwnedArmyUseCasesPort,
  logger: LoggerPort,
): RouteRegistry => [
  implementGetRoute(getOwnedArmiesContract, logger, {
    handler: async (_request, auth) => {
      const subject = requireSubject(auth);
      if (subject === undefined) {
        return missingAuth;
      }
      return ownedArmyUseCases.getOwnedArmies(subject);
    },
  }),
  implementGetRoute(getOwnedArmyByIdContract, logger, {
    handler: async (request, auth) => {
      const subject = requireSubject(auth);
      if (subject === undefined) {
        return missingAuth;
      }
      return ownedArmyUseCases.getOwnedArmyById(subject, request.params.id);
    },
  }),
  implementPostRoute(createOwnedArmyContract, logger, {
    handler: async (_request, auth) => {
      const subject = requireSubject(auth);
      if (subject === undefined) {
        return missingAuth;
      }
      return ownedArmyUseCases.createOwnedArmy(subject);
    },
  }),
  implementPutRoute(updateOwnedArmyContract, logger, {
    handler: async (request, auth) => {
      const subject = requireSubject(auth);
      if (subject === undefined) {
        return missingAuth;
      }
      return ownedArmyUseCases.updateOwnedArmy(
        subject,
        request.params.id,
        request.body,
      );
    },
  }),
  implementDeleteRoute(archiveOwnedArmyContract, logger, {
    handler: async (request, auth) => {
      const subject = requireSubject(auth);
      if (subject === undefined) {
        return missingAuth;
      }
      return ownedArmyUseCases.archiveOwnedArmy(subject, request.params.id);
    },
  }),
];

export { createOwnedArmyRoutes };
