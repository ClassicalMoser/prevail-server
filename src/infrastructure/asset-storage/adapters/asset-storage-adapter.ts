import type { AssetStorage } from '@ports';
import { putImmutable } from '../put-immutable';

const assetStorageAdapter: AssetStorage = {
  putImmutable,
};

export { assetStorageAdapter };
