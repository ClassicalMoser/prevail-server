import type { FastifyCorsOptions } from '@fastify/cors';

/**
 * CORS settings for the HTTP adapter.
 *
 * fastify-cors v11+ defaults to safelisted methods (GET, HEAD, POST) only.
 * Authenticated DELETE routes (and future PUT/PATCH routes) require explicit
 * method and header allowlists or preflight responses omit them.
 */
const CORS_ALLOWED_METHODS = [
  'GET',
  'HEAD',
  'PUT',
  'PATCH',
  'POST',
  'DELETE',
] as const;

const CORS_ALLOWED_HEADERS = ['Content-Type', 'Authorization'] as const;

const CORS_PREFLIGHT_MAX_AGE_SECONDS = 86_400;

const createCorsOptions = (
  allowedOrigins: readonly string[],
): FastifyCorsOptions => ({
  origin: [...allowedOrigins],
  credentials: true,
  methods: [...CORS_ALLOWED_METHODS],
  allowedHeaders: [...CORS_ALLOWED_HEADERS],
  maxAge: CORS_PREFLIGHT_MAX_AGE_SECONDS,
});

export {
  CORS_ALLOWED_HEADERS,
  CORS_ALLOWED_METHODS,
  CORS_PREFLIGHT_MAX_AGE_SECONDS,
  createCorsOptions,
};
