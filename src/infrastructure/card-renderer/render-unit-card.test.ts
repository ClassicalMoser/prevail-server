import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { renderUnitCard } from './render-unit-card';
import { tempUnits } from '@testing';

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

describe('renderUnitCard function', () => {
  let assetsDir = '';

  // A throwaway assets folder with the unit template, an icon and a font.
  beforeEach(async () => {
    vi.clearAllMocks();
    assetsDir = await mkdtemp(path.join(tmpdir(), 'prevail-unit-assets-'));
    await mkdir(path.join(assetsDir, 'templates'));
    await mkdir(path.join(assetsDir, 'icons'));
    await writeFile(path.join(assetsDir, 'templates', 'unit.typ'), '// unit');
    await writeFile(path.join(assetsDir, 'icons', 'mark.svg'), '<svg />');
    await writeFile(path.join(assetsDir, 'Cinzel-Regular.ttf'), 'font');
  });

  afterEach(async () => {
    await rm(assetsDir, { recursive: true, force: true });
  });

  it(
    'compiles a unit without artwork when unitImage is false',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const { runTypstCompile } = await import('./run-typst-compile');
      // A catalog unit with its artwork URL cleared.
      const unit = tempUnits[0];
      assert.ok(unit !== undefined);

      const result = await renderUnitCard(
        { ...unit, imageUrl: null },
        // unitImage is false, so no artwork is fetched and the allowed origin
        // goes unused.
        { bleed: false, format: 'svg', unitImage: false },
        {
          allowedMediaOrigin: 'https://cdn.example',
          assetsDir,
        },
      );

      // The compiler runs once for the unit.
      expect(runTypstCompile).toHaveBeenCalledTimes(1);
      // The compiled buffer is returned as the success data.
      expect(result).toStrictEqual({
        data: Buffer.from('compiled'),
        success: true,
      });
    },
  );
});
