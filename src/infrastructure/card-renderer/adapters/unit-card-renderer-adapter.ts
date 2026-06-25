import type { UnitCardRendererPort } from '@ports';
import { renderUnitCard } from '../render-unit-card';

export const unitCardRendererAdapter: UnitCardRendererPort = {
  renderUnitCard: async (unitType, details) =>
    await renderUnitCard(unitType, details),
};
