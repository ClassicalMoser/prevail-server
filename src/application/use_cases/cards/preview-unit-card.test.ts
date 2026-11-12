import type { UnitCardRendererPort } from '@ports';
import { stubAssetStorage, tempUnits, unitCardStorageDouble } from '@testing';
import type { UnitCardUseCasesDeps } from './unit-card-use-cases-deps';
import { previewUnitCard } from './preview-unit-card';

/** Deps whose renderer answers as the test says. */
const depsRendering = (
  render: UnitCardRendererPort['renderUnitCard'],
): UnitCardUseCasesDeps => ({
  assetStorage: stubAssetStorage(),
  unitCardRenderer: { renderUnitCard: render },
  unitCardStorage: unitCardStorageDouble(),
});

describe('previewUnitCard function', () => {
  it(
    'answers the drawn SVG as text, without storing it',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const deps = depsRendering(
        vi
          .fn<UnitCardRendererPort['renderUnitCard']>()
          .mockResolvedValue({ data: Buffer.from('<svg/>'), success: true }),
      );

      await expect(previewUnitCard(deps, tempUnits[0])).resolves.toStrictEqual({
        data: '<svg/>',
        success: true,
      });
      expect(deps.assetStorage.putImmutable).not.toHaveBeenCalled();
    },
  );

  it('answers the render failure unchanged', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    const deps = depsRendering(
      vi.fn<UnitCardRendererPort['renderUnitCard']>().mockResolvedValue({
        message: 'render failed',
        status: 500,
        success: false,
      }),
    );

    await expect(previewUnitCard(deps, tempUnits[0])).resolves.toStrictEqual({
      message: 'render failed',
      status: 500,
      success: false,
    });
  });
});
