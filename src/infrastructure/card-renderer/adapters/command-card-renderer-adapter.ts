import type { CommandCardRendererPort } from '@ports';
import { renderCommandCard } from '../render-command-card';

export const commandCardRendererAdapter: CommandCardRendererPort = {
  renderCommandCard: async (card, details) =>
    await renderCommandCard(card, details),
};
