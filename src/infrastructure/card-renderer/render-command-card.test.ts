import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { tempCommandCards } from '@classicalmoser/prevail-rules/domain';
import { renderCommandCard } from './render-command-card';

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
      const card = tempCommandCards[0];
      assert.ok(card !== undefined);

      const result = await renderCommandCard(
        card,
        { bleed: false, format: 'svg', unitImage: false },
        { assetsDir },
      );

      expect(runTypstCompile).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({
        data: Buffer.from('compiled'),
        success: true,
      });
    },
  );
});
