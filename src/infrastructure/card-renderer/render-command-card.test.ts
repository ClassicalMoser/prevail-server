import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { renderCommandCard } from './render-command-card';
import { tempCommandCards } from '@testing';

// The Typst compile is stubbed to return a fixed buffer: the real compiler is
// an external binary, and this test covers only the render's own steps.
vi.mock(import('./run-typst-compile'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    runTypstCompile: vi.fn<() => Promise<Buffer>>(async () =>
      Buffer.from('compiled'),
    ),
  };
});

describe('renderCommandCard function', () => {
  let assetsDir = '';

  // A throwaway assets folder with the command template, an icon and a font.
  beforeEach(async () => {
    vi.clearAllMocks();
    assetsDir = await mkdtemp(path.join(tmpdir(), 'prevail-cmd-assets-'));
    await mkdir(path.join(assetsDir, 'templates'));
    await mkdir(path.join(assetsDir, 'icons'));
    await writeFile(
      path.join(assetsDir, 'templates', 'command.typ'),
      '// command',
    );
    await writeFile(path.join(assetsDir, 'icons', 'mark.svg'), '<svg />');
    await writeFile(path.join(assetsDir, 'Cinzel-Regular.ttf'), 'font');
  });

  afterEach(async () => {
    await rm(assetsDir, { recursive: true, force: true });
  });

  it(
    'writes card JSON and returns the Typst compile buffer',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const { runTypstCompile } = await import('./run-typst-compile');
      // A catalog command card.
      const card = tempCommandCards[0];
      assert.ok(card !== undefined);

      const result = await renderCommandCard(
        card,
        // SVG output with no bleed and no unit image, which a command card does
        // not have.
        { bleed: false, format: 'svg', unitImage: false },
        { assetsDir },
      );

      // The compiler runs once for the card.
      expect(runTypstCompile).toHaveBeenCalledTimes(1);
      // The compiled buffer is returned as the success data.
      expect(result).toStrictEqual({
        data: Buffer.from('compiled'),
        success: true,
      });
    },
  );
});
