import { glob, readFile } from 'node:fs/promises';
import { boundaries } from '../../boundaries';
import { measureBodyDensity } from './measure-body-density';
import type { BodyDensity } from './body-density';
import type { ScopeDensity } from './scope-density';

/**
 * Adds one module's lines into a running total.
 *
 * @param total - The running total, which is replaced rather than mutated
 * @param addition - One module's lines
 * @returns The combined total
 */
function addDensity(total: BodyDensity, addition: BodyDensity): BodyDensity {
  // A new object rather than a mutation, so a caller holding the old total
  // keeps the number it read.
  const combined: BodyDensity = {
    code: total.code + addition.code,
    comments: total.comments + addition.comments,
  };
  return combined;
}

/**
 * Measures every boundary in `boundaries.ts`, in that file's order.
 *
 * Reading the boundary list means a new layer is measured without anyone
 * editing this script, the same way the mutation shards are built. Barrels are
 * left out because a barrel has no body, so including them would only dilute
 * the scope with lines the standard does not reach.
 *
 * @returns One entry per boundary that has any file, in boundary order
 */
export async function measureScopes(): Promise<ScopeDensity[]> {
  const measured: ScopeDensity[] = [];

  for (const boundary of boundaries) {
    // Every `.ts` under the boundary, specs included: they are reported in
    // their own column rather than measured as a separate tree, because a
    // spec belongs to the layer it tests.
    const paths = await Array.fromAsync(glob(`src/${boundary.dir}/**/*.ts`));

    // A boundary with no files is not a gap; some are declarations only, and
    // reporting a zero for them would read as a finding.
    if (paths.length === 0) {
      continue;
    }

    let source: BodyDensity = { code: 0, comments: 0 };
    let specs: BodyDensity = { code: 0, comments: 0 };
    for (const file of paths) {
      // A barrel re-exports and declares nothing, so it has no body to measure.
      if (file.endsWith('index.ts')) {
        continue;
      }
      const text = await readFile(file, 'utf8');
      const density = measureBodyDensity(text);

      // The two columns are kept apart for the whole walk, because the gap
      // between them is the thing worth seeing.
      if (file.endsWith('.test.ts')) {
        specs = addDensity(specs, density);
      } else {
        source = addDensity(source, density);
      }
    }

    // The alias carries an `@` that no other output uses, so it is dropped
    // here rather than at each print site.
    const scope = boundary.identifier.replace(/^@/u, '');
    measured.push({ scope, source, specs });
  }

  return measured;
}
