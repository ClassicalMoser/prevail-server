import FastifyInstance from 'fastify';
import { createRoutes } from '@interface';
import { createCommandCardStorage } from '@infrastructure';

const app = FastifyInstance();

const commandCardStorageRoutes = await createCommandCardStorage();

const routes = await createRoutes(commandCardStorageRoutes);
for (const route of routes) {
  app.get(route.url, route.handler);
}

export { app };
