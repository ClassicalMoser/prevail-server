import type { CommandCard } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports/data-error-signature-port';
import type { RenderDetails } from './render-details';

// Alias type to clarify that the IDs have been replaced with names.
type PrintCommandCard = CommandCard;

interface CommandCardRendererPort {
  renderCommandCard: (
    card: PrintCommandCard,
    details: RenderDetails,
  ) => Promise<DataErrorSignature<Buffer>>;
}

export type { CommandCardRendererPort, PrintCommandCard };
