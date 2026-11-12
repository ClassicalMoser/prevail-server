import { densityPercent } from './density-percent';
import type { ScopeDensity } from './scope-density';

/** The standard in `STYLE.md`, shown for reference rather than enforced. */
const TARGET = 25;

/**
 * Writes the per-scope densities as lines to print.
 *
 * Source and specs are reported apart because they move apart: a scope the
 * audit has read runs several times the density of one it has not, and the
 * specs trail both. Averaging them would hide exactly that.
 *
 * No scope is marked as passing or failing. The number says how much was
 * written, never whether it was worth writing, and a reader who wants the
 * second question has to open the file.
 *
 * @param measured - Every scope's density, in boundary order
 * @returns The report, one line per scope plus a header and a summary
 */
export function reportCommentary(measured: ScopeDensity[]): string[] {
  // The header states the measure, because the same number read against whole
  // files is roughly a third of this one and the two get confused.
  const lines = [
    `In-body commentary, comments over code. ${TARGET}% is the standard in STYLE.md.`,
    '',
    '  scope           source   specs',
  ];

  // Running totals, so the summary is the repository rather than a mean of
  // means: one 25-line scope would otherwise weigh as much as transforms.
  let sourceComments = 0;
  let sourceCode = 0;
  let specComments = 0;
  let specCode = 0;

  for (const entry of measured) {
    const source = densityPercent(entry.source);
    const specs = densityPercent(entry.specs);

    // Padded to the width of the longest boundary alias, so the columns line up
    // and a layer can be compared against its neighbours by scanning down.
    const name = entry.scope.padEnd(14, ' ');
    const sourceText = String(source).padStart(5, ' ');
    const specText = String(specs).padStart(5, ' ');
    lines.push(`  ${name} ${sourceText}%  ${specText}%`);

    sourceComments += entry.source.comments;
    sourceCode += entry.source.code;
    specComments += entry.specs.comments;
    specCode += entry.specs.code;
  }

  // The summary counts body lines rather than files, because that is the
  // denominator the standard uses and the one the scopes above are measured on.
  const sourceTotal = densityPercent({
    code: sourceCode,
    comments: sourceComments,
  });
  const specTotal = densityPercent({ code: specCode, comments: specComments });
  const sourceLines = sourceCode + sourceComments;
  const specLines = specCode + specComments;
  lines.push(
    '',
    `  source ${sourceTotal}% of ${sourceLines} body lines, specs ${specTotal}% of ${specLines}.`,
    '',
    'A number is not a verdict. A comment that restates the code raises it and',
    'makes the file worse; see STYLE.md on commentary before writing any.',
  );
  return lines;
}
