import type { UnitType } from '@classicalmoser/prevail-rules/domain';
import type { DataErrorSignature } from '@ports/data-error-signature-port';
import type { RenderDetails } from './render-details';

interface UnitCardRendererPort {
  renderUnitCard: (
    unitType: UnitType,
    details: RenderDetails,
  ) => Promise<DataErrorSignature<Buffer>>;
}

export type { UnitCardRendererPort };
