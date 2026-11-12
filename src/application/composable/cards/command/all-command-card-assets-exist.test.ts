import assert from 'node:assert/strict';
import type { AssetStorage, UploadResult } from '@ports';
import { allCommandCardAssetsExist } from './all-command-card-assets-exist';
import { tempCommandCards } from '@testing';

const card = tempCommandCards[0];
assert.ok(card !== undefined);

const assetStorage = (existing: Set<string>): AssetStorage => ({
  objectExists: async (key): Promise<boolean> => existing.has(key),
  putImmutable: async (key): Promise<UploadResult> => {
    existing.add(key);
    return { kind: 'written' };
  },
});

describe('allCommandCardAssetsExist function', () => {
  it(
    'returns false when any command asset key is missing',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // Storage holds none of the card's files, so the card is not fully printed.
      const exists = await allCommandCardAssetsExist(
        assetStorage(new Set()),
        card,
      );

      expect(exists).toBe(false);
    },
  );
});
