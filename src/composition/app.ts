import FastifyInstance from 'fastify';
import { createRoutes } from '@interface';
import type { LoggerPort, StoragePort, UseCasesPort } from '@ports';
import process from 'node:process';
import { createDbRoot } from '@infrastructure';
import { createUseCasesRoot } from '@application';

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

const dbRoot: StoragePort = createDbRoot(logger, connectionString);

const useCases: UseCasesPort = createUseCasesRoot(dbRoot);

const routes = createRoutes(useCases);

for (const route of routes) {
  app.route({
    method: route.method,
    url: route.url,
    handler: (request, reply) =>
      route.handler(
        {
          params: request.params,
          body: request.body,
          query: request.query,
        },
        {
          send: (payload) => reply.send(payload),
          status: (code) => reply.status(code),
        },
      ),
  });
}

export { app };
