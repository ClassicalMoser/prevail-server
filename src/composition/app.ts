import FastifyInstance from 'fastify';
import { createRoutes } from '@interface';
import type { LoggerPort, StoragePort, UseCasesPort } from '@ports';
import process from 'node:process';
import { createAuthInfrastructure, createDbRoot } from '@infrastructure';
import { createUseCasesRoot } from '@application';
import { registerHttp } from './register-http';

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

const dbRoot: StoragePort = createDbRoot(logger, connectionString);

const auth = createAuthInfrastructure(logger, {
  domain: auth0Domain,
  audience: auth0Audience,
});

const useCases: UseCasesPort = createUseCasesRoot(dbRoot);

const routes = createRoutes(useCases);

registerHttp(app, auth, routes);

export { app };
