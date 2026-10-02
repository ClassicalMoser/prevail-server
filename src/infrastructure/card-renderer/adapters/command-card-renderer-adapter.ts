import type { CommandCardRendererPort, DataErrorSignature } from '@ports';
import type { CommandCardRendererDeps } from '../card-renderer-deps';
import { renderCommandCard } from '../render-command-card';

/**
 * Close Typst assets into the command-card renderer port.
 *
 * @param deps - Assets directory (and any shared renderer config).
 * @returns Port that renders a command card to bytes.
 */
const createCommandCardRendererAdapter = (
  deps: CommandCardRendererDeps,
): CommandCardRendererPort => ({
  renderCommandCard: async (
    card,
    details,
  ): Promise<DataErrorSignature<Buffer>> =>
    await renderCommandCard(card, details, deps),
});

export { createCommandCardRendererAdapter };
