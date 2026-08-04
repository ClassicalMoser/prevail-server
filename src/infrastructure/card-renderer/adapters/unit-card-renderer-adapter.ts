import type { DataErrorSignature, UnitCardRendererPort } from '@ports';
import type { UnitCardRendererDeps } from '../card-renderer-deps';
import { renderUnitCard } from '../render-unit-card';

const createUnitCardRendererAdapter = (
  deps: UnitCardRendererDeps,
): UnitCardRendererPort => ({
  renderUnitCard: async (unitType, details): Promise<DataErrorSignature<Buffer>> =>
    await renderUnitCard(unitType, details, deps),
});

export { createUnitCardRendererAdapter };
