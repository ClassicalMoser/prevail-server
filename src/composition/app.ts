import FastifyInstance from 'fastify';
import cors from '@fastify/cors';
import { createRoutes, createWsRoutes } from '@interface';
import type { LoggerPort, StoragePort, UseCasesPort } from '@ports';
import process from 'node:process';
import {
  createR2Client,
  createAssetStorage,
  createCommandCardRendererAdapter,
  createAuthInfrastructure,
  createDbRoot,
  createUnitCardRendererAdapter,
} from '@infrastructure';
import { createGameSessionUseCases, createUseCasesRoot } from '@application';
import { registerHttp } from './register-http';
import { registerWs } from './register-ws';
import { createCorsOptions } from './cors-options';
import { createFanoutEnginePorts } from './create-fanout-engine-ports';
import { readAllowedMediaOrigin } from './read-allowed-media-origin';
import { readClientOrigins } from './read-client-origins';
import { requireEnv } from './require-env';
import { resolveCardRendererAssetsDir } from './resolve-card-renderer-assets-dir';

/** Process-wide Fastify instance; configured by {@link configureApp}. */
const app = FastifyInstance({ logger: true });

const logger: LoggerPort = {
  info: (message: string): void => app.log.info(message),
  warn: (message: string): void => app.log.warn(message),
  error: (message: string): void => app.log.error(message),
};

// Startup fails here, naming the variable, if anything the server needs is unset.
const connectionString = requireEnv(process.env, 'DB_CONNECTION_STRING');
const auth0Domain = requireEnv(process.env, 'AUTH0_DOMAIN');
const auth0Audience = requireEnv(process.env, 'AUTH0_AUDIENCE');
const clientOrigins = readClientOrigins(process.env.CLIENT_ORIGINS);
const allowedMediaOrigin = readAllowedMediaOrigin(process.env);
const cardRendererAssetsDir = resolveCardRendererAssetsDir(
  process.env.CARD_RENDERER_ASSETS_DIR,
  process.cwd(),
);

// Card images and print files live in Cloudflare R2, which speaks the S3 API.
const r2Client = createR2Client({
  endpoint: requireEnv(process.env, 'R2_S3_ENDPOINT'),
  accessKeyId: requireEnv(process.env, 'R2_ACCESS_KEY_ID'),
  secretAccessKey: requireEnv(process.env, 'R2_SECRET_ACCESS_KEY'),
});

const assetStorage = createAssetStorage({
  bucket: requireEnv(process.env, 'R2_BUCKET'),
  client: r2Client,
});

const dbRoot: StoragePort = createDbRoot(logger, connectionString);

const auth = createAuthInfrastructure(logger, {
  domain: auth0Domain,
  audience: auth0Audience,
});

// Live games write through engine ports that fan each write out to sockets.
// The session does not exist until its use cases are built, so the session is
// bound to the ports after.
const { enginePorts, bindSession } = createFanoutEnginePorts();

const gameSessionUseCases = createGameSessionUseCases({
  enginePorts,
  ownedArmyStorage: dbRoot.ownedArmyStorage,
});
bindSession(gameSessionUseCases);

const useCases: UseCasesPort = createUseCasesRoot({
  storagePort: dbRoot,
  commandCardRenderer: createCommandCardRendererAdapter({
    assetsDir: cardRendererAssetsDir,
  }),
  unitCardRenderer: createUnitCardRendererAdapter({
    allowedMediaOrigin,
    assetsDir: cardRendererAssetsDir,
  }),
  assetStorage,
  gameSessionUseCases,
});

const routes = createRoutes(useCases, logger);
const wsRoutes = createWsRoutes(gameSessionUseCases, logger);

/**
 * Mount CORS, HTTP routes, and WebSocket seats on the process Fastify app.
 *
 * HTTP auth runs in route registration. WebSocket upgrade auth runs when the
 * socket opens. Both share the Auth0 adapter created at startup.
 */
const configureApp = async (): Promise<void> => {
  await app.register(cors, createCorsOptions(clientOrigins));

  registerHttp(app, auth, routes);
  await registerWs(app, auth, wsRoutes);
};

export { app, configureApp };
