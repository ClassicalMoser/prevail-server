import FastifyInstance from 'fastify';
import cors from '@fastify/cors';
import { createRoutes } from '@interface';
import type { LoggerPort, StoragePort, UseCasesPort } from '@ports';
import path from 'node:path';
import process from 'node:process';
import {
  createR2Client,
  createAssetStorage,
  createCommandCardRendererAdapter,
  createAuthInfrastructure,
  createDbRoot,
  createUnitCardRendererAdapter,
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

if (!process.env.R2_S3_ENDPOINT) {
  throw new Error('R2_S3_ENDPOINT is not set');
}

if (!process.env.R2_ACCESS_KEY_ID) {
  throw new Error('R2_ACCESS_KEY_ID is not set');
}

if (!process.env.R2_SECRET_ACCESS_KEY) {
  throw new Error('R2_SECRET_ACCESS_KEY is not set');
}

if (!process.env.R2_BUCKET) {
  throw new Error('R2_BUCKET is not set');
}

const allowedMediaOrigin = process.env.ALLOWED_MEDIA_ORIGIN;
if (!allowedMediaOrigin) {
  throw new Error('ALLOWED_MEDIA_ORIGIN is not set');
}

if (!URL.canParse(allowedMediaOrigin)) {
  throw new Error('ALLOWED_MEDIA_ORIGIN must be a valid URL origin');
}

const cardRendererAssetsDir =
  process.env.CARD_RENDERER_ASSETS_DIR !== undefined &&
  process.env.CARD_RENDERER_ASSETS_DIR.length > 0
    ? path.resolve(process.env.CARD_RENDERER_ASSETS_DIR)
    : path.join(process.cwd(), 'card-renderer');

const r2Client = createR2Client({
  endpoint: process.env.R2_S3_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
});

const assetStorage = createAssetStorage({
  bucket: process.env.R2_BUCKET,
  client: r2Client,
});

const dbRoot: StoragePort = createDbRoot(logger, connectionString);

const auth = createAuthInfrastructure(logger, {
  domain: auth0Domain,
  audience: auth0Audience,
});

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
});

const routes = createRoutes(useCases, logger);

const configureApp = async (): Promise<void> => {
  await app.register(cors, createCorsOptions(clientOrigins));

  registerHttp(app, auth, routes);
};

export { app, configureApp };
