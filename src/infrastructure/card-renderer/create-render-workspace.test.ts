import {
  lstat,
  mkdir,
  mkdtemp,
  realpath,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRenderWorkspace } from './create-render-workspace';

describe('createRenderWorkspace function', () => {
  let assetsDir: string = '';

  // A throwaway assets folder with a unit template, a command template, an icon
  // and a font, as the renderer expects to find them.
  beforeEach(async () => {
    assetsDir = await mkdtemp(path.join(tmpdir(), 'prevail-card-assets-'));
    await mkdir(path.join(assetsDir, 'templates'));
    await mkdir(path.join(assetsDir, 'icons'));
    await writeFile(path.join(assetsDir, 'templates', 'unit.typ'), '// unit');
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
    'copies static assets into the workspace as real paths under the root',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // The workspace is a per-render copy, so a render cannot change the
      // shared assets.
      const workspace = await createRenderWorkspace(assetsDir);

      try {
        const templatePath = path.join(
          workspace.workspaceDir,
          'templates',
          'unit.typ',
        );
        // The workspace paths are inspected without following links.
        const templateStat = await lstat(templatePath);
        const resolvedTemplate = await realpath(templatePath);
        const resolvedRoot = await realpath(workspace.workspaceDir);

        // Files are copied, not linked: the compiler is run on real files
        // inside the workspace.
        expect(templateStat.isSymbolicLink()).toBe(false);
        expect(resolvedTemplate.startsWith(`${resolvedRoot}${path.sep}`)).toBe(
          true,
        );

        // Icons are copied the same way.
        const iconStat = await lstat(
          path.join(workspace.workspaceDir, 'icons', 'mark.svg'),
        );
        expect(iconStat.isSymbolicLink()).toBe(false);

        // The font is copied the same way.
        const fontStat = await lstat(
          path.join(workspace.workspaceDir, 'Cinzel-Regular.ttf'),
        );
        expect(fontStat.isSymbolicLink()).toBe(false);
      } finally {
        await workspace.cleanup();
      }
    },
  );
});
