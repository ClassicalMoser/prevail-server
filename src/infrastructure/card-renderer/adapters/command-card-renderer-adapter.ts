import type { CommandCardRendererPort, DataErrorSignature } from '@ports';
import type { CommandCardRendererDeps } from '../card-renderer-deps';
import { renderCommandCard } from '../render-command-card';

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
