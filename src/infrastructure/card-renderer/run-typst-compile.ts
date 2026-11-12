import { execFile as execFileCallback } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);

/**
 * Compile a Typst template in a workspace and return stdout as bytes.
 *
 * Output goes to `-` so the renderer never leaves a file on disk besides the
 * workspace inputs. Fonts resolve from the workspace root.
 *
 * @param workspaceDir - Temporary directory with templates and JSON inputs.
 * @param templatePath - Absolute path to the `.typ` entry file.
 * @param format - Typst `--format` value (`svg`, `pdf`, …).
 * @returns Compiled artifact bytes.
 */
const runTypstCompile = async (
  workspaceDir: string,
  templatePath: string,
  format: string,
): Promise<Buffer> => {
  // execFile with an argument array (no shell) keeps paths and format from being
  // interpreted as commands.
  // The compiled card is read back from stdout, so a render leaves nothing
  // behind for the next request to find or for a client to guess a path to.
  const { stdout } = await execFile(
    'typst',
    [
      'compile',
      templatePath,
      '-',
      '--root',
      workspaceDir,
      '--font-path',
      workspaceDir,
      '--format',
      format,
    ],
    {
      encoding: 'buffer',
      // Stdout holds the whole card; a larger one fails the render instead of
      // growing the server's memory without bound.
      maxBuffer: 10 * 1024 * 1024,
    },
  );
  const compiled = Buffer.isBuffer(stdout) ? stdout : Buffer.from(stdout);
  return compiled;
};

/**
 * Resolve a template path inside a render workspace.
 *
 * @param workspaceDir - Temporary workspace root.
 * @param templateName - `command.typ` or `unit.typ`.
 * @returns Absolute path under `templates/`.
 */
const templatePathInWorkspace = (
  workspaceDir: string,
  templateName: 'command.typ' | 'unit.typ',
): string => path.join(workspaceDir, 'templates', templateName);

export { runTypstCompile, templatePathInWorkspace };
