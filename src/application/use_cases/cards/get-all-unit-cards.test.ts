import type { UnitCardStorage } from '@ports';
import {
  stubAssetStorage,
  stubUnitCardRenderer,
  unitCardStorageDouble,
} from '@testing';
import { getAllUnitCards } from './get-all-unit-cards';
import type { UnitCardUseCasesDeps } from './unit-card-use-cases-deps';

/** Deps where only the list read is programmed. */
const depsListing = (
  getAll: UnitCardStorage['getAllUnitCards'],
): UnitCardUseCasesDeps => ({
  assetStorage: stubAssetStorage(),
  unitCardRenderer: stubUnitCardRenderer(),
  unitCardStorage: unitCardStorageDouble({ getAllUnitCards: getAll }),
});

describe('getAllUnitCards function', () => {
  it('answers the storage failure unchanged', { timeout: 5000 }, async () => {
    expect.hasAssertions();

    // Storage's list read fails; the renderer and asset storage are inert stubs, as this use case does not draw.
    const deps = depsListing(
      vi.fn<UnitCardStorage['getAllUnitCards']>().mockResolvedValue({
        message: 'boom',
        status: 500,
        success: false,
      }),
    );

    // The use case adds nothing to a storage failure.
    await expect(getAllUnitCards(deps)).resolves.toStrictEqual({
      message: 'boom',
      status: 500,
      success: false,
    });
  });

  it(
    'answers an empty catalog as an empty list',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // A catalog with no cards yet is a valid answer, not an error.
      const deps = depsListing(
        vi
          .fn<UnitCardStorage['getAllUnitCards']>()
          .mockResolvedValue({ data: [], success: true }),
      );

      await expect(getAllUnitCards(deps)).resolves.toStrictEqual({
        data: [],
        success: true,
      });
    },
  );
});
