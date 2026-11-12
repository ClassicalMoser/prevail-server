/** Where inner layers report what happened; the composition root supplies Fastify's logger. */
interface LoggerPort {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
}

export type { LoggerPort };
