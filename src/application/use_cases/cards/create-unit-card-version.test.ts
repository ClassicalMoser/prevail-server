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

      // The storage mock returns the row as stored, with the next version number.
      const inserted = { ...validUnitA, version: '1.0.1' };
      const createVersion = vi
        .fn<UnitCardStorage['createUnitCardVersion']>()
        .mockResolvedValue({ success: true, data: inserted });

      // Renderer and asset storage are shared stubs that count calls, so the projection can be counted.
      const useCaseDeps = deps({
        unitCardStorage: unitCardStorageDouble({
          createUnitCardVersion: createVersion,
        }),
      });

      const result = await createUnitCardVersion(useCaseDeps, validUnitA);

      expect(result).toStrictEqual({ success: true, data: inserted });
      // The same number of renders and stored assets: each projected asset is drawn once and stored once.
      expect(stubRenderer.renderUnitCard).toHaveBeenCalledTimes(3);
      expect(stubAssets.putImmutable).toHaveBeenCalledTimes(3);
    },
  );

  it(
    'deletes the version row when projection fails',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The version row is inserted successfully, so there is a row to take back.
      const inserted = { ...validUnitA, version: '1.0.1' };
      const createVersion = vi
        .fn<UnitCardStorage['createUnitCardVersion']>()
        .mockResolvedValue({ success: true, data: inserted });
      // The rollback path: a version row whose assets did not project must be removed.
      const deleteVersion = vi
        .fn<UnitCardStorage['deleteUnitCardVersion']>()
        .mockResolvedValue({ success: true, data: undefined });
      // A renderer that fails, so projection after the insert cannot complete.
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
      // The failure is reported as the renderer said, and the half-created version row is deleted.
      expect(deleteVersion).toHaveBeenCalledWith(inserted);
    },
  );
});
