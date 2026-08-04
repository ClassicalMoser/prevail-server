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

      const workspace = await createRenderWorkspace(assetsDir);

      try {
        const templatePath = path.join(
          workspace.workspaceDir,
          'templates',
          'unit.typ',
        );
        const templateStat = await lstat(templatePath);
        const resolvedTemplate = await realpath(templatePath);
        const resolvedRoot = await realpath(workspace.workspaceDir);

        expect(templateStat.isSymbolicLink()).toBe(false);
        expect(resolvedTemplate.startsWith(`${resolvedRoot}${path.sep}`)).toBe(
          true,
        );

        const iconStat = await lstat(
          path.join(workspace.workspaceDir, 'icons', 'mark.svg'),
        );
        expect(iconStat.isSymbolicLink()).toBe(false);

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
