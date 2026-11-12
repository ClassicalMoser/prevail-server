import type {
  AssetStorage,
  UnitCardRendererPort,
  UnitCardStorage,
} from '@ports';

/** The ports the unit-card use cases run on. */
interface UnitCardUseCasesDeps {
  unitCardStorage: UnitCardStorage;
  unitCardRenderer: UnitCardRendererPort;
  assetStorage: AssetStorage;
}

export type { UnitCardUseCasesDeps };
