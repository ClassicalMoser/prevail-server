import { cardAssetKey, cardAssetTargets } from './card-asset-keys';

describe('cardAssetKey function', () => {
  it(
    'builds the svg path for the kind, id, and version this test set',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // A command card's svg key is built from kind, id and version, with the extension of its type.
      const key = cardAssetKey({
        assetType: 'svg',
        cardId: 'card-1',
        kind: 'command',
        version: '1.0.0',
      });

      expect(key).toBe('cards/command/svg/card-1_1.0.0.svg');
    },
  );

  it(
    'builds the bleed pdf path under the print folder',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // Print assets live under a print folder; the bleed variant has its own extension so it cannot collide with the plain pdf.
      const key = cardAssetKey({
        assetType: 'pdf-bleed',
        cardId: 'unit-1',
        kind: 'unit',
        version: '2.1.0',
      });

      expect(key).toBe('cards/unit/print/unit-1_2.1.0.bleed.pdf');
    },
  );
});

describe('cardAssetTargets function', () => {
  it(
    'returns svg, pdf, and bleed targets for the card this test named',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // One card projects three files: svg, pdf and bleed pdf.
      const targets = cardAssetTargets('command', {
        id: 'card-1',
        version: '1.0.0',
      });

      expect(targets).toStrictEqual([
        { key: 'cards/command/svg/card-1_1.0.0.svg', type: 'svg' },
        { key: 'cards/command/print/card-1_1.0.0.pdf', type: 'pdf' },
        {
          key: 'cards/command/print/card-1_1.0.0.bleed.pdf',
          type: 'pdf-bleed',
        },
      ]);
    },
  );
});
