import assert from 'node:assert/strict';
import {
  commandCardAssetKey,
  commandCardAssetTargets,
} from './command-card-asset-keys';
import { tempCommandCards } from '@testing';

const card = tempCommandCards[0];
assert.ok(card !== undefined);

describe('commandCardAssetKey function', () => {
  it(
    'builds a command-kind key for the id and version this test set',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // The command-card helper fixes the kind to command, so only the id, version and type vary.
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

      // A command card has the same three assets as any card: svg, pdf and bleed pdf, with the svg first.
      const targets = commandCardAssetTargets(card);

      expect(targets).toHaveLength(3);
      expect(targets[0]).toMatchObject({
        key: `cards/command/svg/${card.id}_${card.version}.svg`,
        type: 'svg',
      });
    },
  );
});
