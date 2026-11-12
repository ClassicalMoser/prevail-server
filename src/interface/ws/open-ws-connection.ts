import type { LoggerPort } from '@ports';
import { handleError } from '@utils';
import type { WsOpenResult } from './ws-types';

/**
 * Run a route's open handler, turning a throw into an internal-error close.
 *
 * Opening is where a client is registered for a game. If that throws, the
 * client is closed with 1011 rather than left connected to nothing.
 *
 * @param input - The open call, the route path, and where to log a throw.
 * @returns The handler's result, or a 1011 close on a throw.
 */
const openWsConnection = async <THandle>(input: {
  open: () => Promise<WsOpenResult<THandle>>;
  path: string;
  logger: LoggerPort;
}): Promise<WsOpenResult<THandle>> => {
  try {
    const result = await input.open();
    return result;
  } catch (error) {
    handleError({
      context: `opening WS ${input.path}`,
      error,
      logger: input.logger,
      message: `Failed to open ${input.path}`,
      status: 500,
    });
    const closed: WsOpenResult<THandle> = {
      closeCode: 1011,
      ok: false,
      reason: 'Internal error',
    };
    return closed;
  }
};

export { openWsConnection };
