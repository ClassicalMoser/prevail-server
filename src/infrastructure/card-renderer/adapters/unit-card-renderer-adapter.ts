import type { DataErrorSignature, UnitCardRendererPort } from '@ports';
import type { UnitCardRendererDeps } from '../card-renderer-deps';
import { renderUnitCard } from '../render-unit-card';

/**
 * Close Typst assets and allowed media origin into the unit-card renderer port.
 *
 * @param deps - Assets directory and origin allowlist for unit artwork.
 * @returns Port that renders a unit card to bytes.
 */
const createUnitCardRendererAdapter = (
  deps: UnitCardRendererDeps,
): UnitCardRendererPort => ({
  renderUnitCard: async (
    unitType,
    details,
  ): Promise<DataErrorSignature<Buffer>> =>
    await renderUnitCard(unitType, details, deps),
});

export { createUnitCardRendererAdapter };
