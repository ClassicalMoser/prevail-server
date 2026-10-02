import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { tempUnits } from '@classicalmoser/prevail-rules/domain';
import { renderUnitCard } from './render-unit-card';

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
      const unit = tempUnits[0];
      assert.ok(unit !== undefined);

      const result = await renderUnitCard(
        { ...unit, imageUrl: null },
        { bleed: false, format: 'svg', unitImage: false },
        {
          allowedMediaOrigin: 'https://cdn.example',
          assetsDir,
        },
      );

      expect(runTypstCompile).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        data: Buffer.from('compiled'),
        success: true,
      });
    },
  );
});
