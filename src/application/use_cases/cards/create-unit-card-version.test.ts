import type { UnitCardRendererPort, UnitCardStorage } from '@ports';
import type { UnitCardUseCasesDeps } from './unit-card-use-cases-deps';
import { createUnitCardVersion } from './create-unit-card-version';
import {
  stubAssetStorage,
  stubUnitCardRenderer,
  tempUnits,
  unitCardStorageDouble,
} from '@testing';

const stubRenderer = stubUnitCardRenderer();
const stubAssets = stubAssetStorage();

const deps = (
  overrides: Partial<UnitCardUseCasesDeps> = {},
): UnitCardUseCasesDeps => ({
  unitCardStorage: unitCardStorageDouble(),
  unitCardRenderer: stubRenderer,
  assetStorage: stubAssets,
  ...overrides,
});
const validUnitA = tempUnits[0];

describe('createUnitCardVersion function', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(
    'projects assets after inserting the version row',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const inserted = { ...validUnitA, version: '1.0.1' };
      const createVersion = vi
        .fn<UnitCardStorage['createUnitCardVersion']>()
        .mockResolvedValue({ success: true, data: inserted });

      const useCaseDeps = deps({
        unitCardStorage: unitCardStorageDouble({
          createUnitCardVersion: createVersion,
        }),
      });

      const result = await createUnitCardVersion(useCaseDeps, validUnitA);

      expect(result).toStrictEqual({ success: true, data: inserted });
      expect(stubRenderer.renderUnitCard).toHaveBeenCalledTimes(3);
      expect(stubAssets.putImmutable).toHaveBeenCalledTimes(3);
    },
  );

  it(
    'deletes the version row when projection fails',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const inserted = { ...validUnitA, version: '1.0.1' };
      const createVersion = vi
        .fn<UnitCardStorage['createUnitCardVersion']>()
        .mockResolvedValue({ success: true, data: inserted });
      const deleteVersion = vi
        .fn<UnitCardStorage['deleteUnitCardVersion']>()
        .mockResolvedValue({ success: true, data: undefined });
      const renderer: UnitCardRendererPort = {
        renderUnitCard: vi
          .fn<UnitCardRendererPort['renderUnitCard']>()
          .mockResolvedValue({
            success: false,
            message: 'render failed',
            status: 500,
          }),
      };

      const useCaseDeps = deps({
        unitCardStorage: unitCardStorageDouble({
          createUnitCardVersion: createVersion,
          deleteUnitCardVersion: deleteVersion,
        }),
        unitCardRenderer: renderer,
      });

      const result = await createUnitCardVersion(useCaseDeps, validUnitA);

      expect(result).toStrictEqual({
        success: false,
        message: 'render failed',
        status: 500,
      });
      expect(deleteVersion).toHaveBeenCalledWith(inserted);
    },
  );
});
