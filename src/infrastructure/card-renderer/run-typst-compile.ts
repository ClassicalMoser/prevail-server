import { execFile as execFileCallback } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';

const execFile = promisify(execFileCallback);

const runTypstCompile = async (
  workspaceDir: string,
  templatePath: string,
  format: string,
): Promise<Buffer> => {
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
      maxBuffer: 10 * 1024 * 1024,
    },
  );

  return stdout as Buffer;
};

const templatePathInWorkspace = (
  workspaceDir: string,
  templateName: 'command.typ' | 'unit.typ',
): string => path.join(workspaceDir, 'templates', templateName);

export { runTypstCompile, templatePathInWorkspace };
