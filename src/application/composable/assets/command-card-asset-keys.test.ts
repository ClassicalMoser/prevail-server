import assert from 'node:assert/strict';
import { tempCommandCards } from '@classicalmoser/prevail-rules/domain';
import {
  commandCardAssetKey,
  commandCardAssetTargets,
} from './command-card-asset-keys';

const card = tempCommandCards[0];
assert.ok(card !== undefined);

describe('commandCardAssetKey function', () => {
  it(
    'builds a command-kind key for the id and version this test set',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const key = commandCardAssetKey(card.id, card.version, 'pdf');

      expect(key).toBe(`cards/command/print/${card.id}_${card.version}.pdf`);
    },
  );
});

describe('commandCardAssetTargets function', () => {
  it(
    'lists every command asset target for the sample card',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const targets = commandCardAssetTargets(card);

      expect(targets).toHaveLength(3);
      expect(targets[0]).toMatchObject({
        key: `cards/command/svg/${card.id}_${card.version}.svg`,
        type: 'svg',
      });
    },
  );
});
