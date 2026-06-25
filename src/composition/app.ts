import FastifyInstance from 'fastify';
import cors from '@fastify/cors';
import { createRoutes } from '@interface';
import type { LoggerPort, StoragePort, UseCasesPort } from '@ports';
import process from 'node:process';
import {
  commandCardRendererAdapter,
  createAuthInfrastructure,
  createDbRoot,
  unitCardRendererAdapter,
} from '@infrastructure';
import { createUseCasesRoot } from '@application';
import { registerHttp } from './register-http';
import { createCorsOptions } from './cors-options';

const app = FastifyInstance({ logger: true });

const logger: LoggerPort = {
  info: (message: string): void => app.log.info(message),
  warn: (message: string): void => app.log.warn(message),
  error: (message: string): void => app.log.error(message),
};

const connectionString = process.env.DB_CONNECTION_STRING;
if (!connectionString) {
  throw new Error('DB_CONNECTION_STRING is not set');
}

const auth0Domain = process.env.AUTH0_DOMAIN;
if (!auth0Domain) {
  throw new Error('AUTH0_DOMAIN is not set');
}

const auth0Audience = process.env.AUTH0_AUDIENCE;
if (!auth0Audience) {
  throw new Error('AUTH0_AUDIENCE is not set');
}

const clientOrigins = (
  process.env.CLIENT_ORIGINS ??
  'http://localhost:1420,http://127.0.0.1:1420,https://app.prevailgame.com'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

const dbRoot: StoragePort = createDbRoot(logger, connectionString);

const auth = createAuthInfrastructure(logger, {
  domain: auth0Domain,
  audience: auth0Audience,
});

const useCases: UseCasesPort = createUseCasesRoot(
  dbRoot,
  commandCardRendererAdapter,
  unitCardRendererAdapter,
);

const routes = createRoutes(useCases, logger);

const configureApp = async (): Promise<void> => {
  await app.register(cors, createCorsOptions(clientOrigins));

  registerHttp(app, auth, routes);
};

export { app, configureApp };
