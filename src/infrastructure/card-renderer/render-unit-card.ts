import { execFile as execFileCallback } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import type { DataErrorSignature, RenderDetails } from '@ports';
import type { UnitType } from '@classicalmoser/prevail-rules/domain';

const execFile = promisify(execFileCallback);

const cardRendererDir = path.join(
  process.cwd(),
  'src/infrastructure/card-renderer',
);

const toRenderErrorMessage = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return 'Failed to render unit card';
  }

  if ('stderr' in error && typeof error.stderr === 'string') {
    const stderr = error.stderr.trim();
    if (stderr.length > 0) {
      return stderr;
    }
  }

  return error.message;
};

const renderUnitCard = async (
  unitType: UnitType,
  details: RenderDetails,
): Promise<DataErrorSignature<string>> => {
  const dataPath = path.join(cardRendererDir, 'unit-card-data.json');
  const detailsPath = path.join(cardRendererDir, 'details.json');
  const templatePath = path.join(cardRendererDir, 'templates/unit.typ');

  try {
    await writeFile(dataPath, JSON.stringify({ unitType }, undefined, 2));
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

export { renderUnitCard };
