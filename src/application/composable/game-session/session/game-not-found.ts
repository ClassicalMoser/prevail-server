import type { ErrorSignature } from '@ports';

/**
 * The envelope for a game this process does not host.
 *
 * Live games exist only in memory, so a restarted server, a mistyped id, and a
 * game of the other kind (a vs-bot id sent to a bot-vs-bot route) all look the
 * same to a caller: not found. One envelope keeps every route's wording and
 * status identical.
 *
 * @returns A 404 envelope.
 */
const gameNotFound = (): ErrorSignature => {
  const missing: ErrorSignature = {
    message: 'Game not found',
    status: 404,
    success: false,
  };
  return missing;
};

export { gameNotFound };
