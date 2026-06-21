import { execFile as execFileCallback } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import type {
  DataErrorSignature,
  PrintCommandCard,
  RenderDetails,
} from '@ports';

const execFile = promisify(execFileCallback);

/** Directory containing templates/, icons/, fonts, and data.json. */
const cardRendererDir = path.join(
  process.cwd(),
  'src/infrastructure/card-renderer',
);

const toRenderErrorMessage = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return 'Failed to render command card';
  }

  if ('stderr' in error && typeof error.stderr === 'string') {
    const stderr = error.stderr.trim();
    if (stderr.length > 0) {
      return stderr;
    }
  }

  return error.message;
};

/**
 * Renders a command card to SVG via the Typst CLI.
 *
 * 1. Writes `payload` to `data.json` (read by templates/command.typ)
 * 2. Runs `typst compile` against that template
 * 3. Returns the SVG string from stdout
 */
const renderCommandCard = async (
  card: PrintCommandCard,
  details: RenderDetails,
): Promise<DataErrorSignature<string>> => {
  const dataPath = path.join(cardRendererDir, 'data.json');
  const detailsPath = path.join(cardRendererDir, 'details.json');
  const templatePath = path.join(cardRendererDir, 'templates/command.typ');

  try {
    await writeFile(dataPath, JSON.stringify({ card }, undefined, 2));
    await writeFile(detailsPath, JSON.stringify(details, undefined, 2));

    const { stdout } = await execFile(
      'typst',
      [
        'compile',
        templatePath,
        '-',
        '--root',
        cardRendererDir,
        '--font-path',
        cardRendererDir,
        '--format',
        'svg',
      ],
      {
        encoding: 'utf8',
        maxBuffer: 10 * 1024 * 1024,
      },
    );

    return { success: true, data: stdout };
  } catch (error) {
    return {
      success: false,
      message: toRenderErrorMessage(error),
      status: 500,
    };
  }
};

export { renderCommandCard };
