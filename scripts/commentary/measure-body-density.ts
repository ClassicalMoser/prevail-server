import type { BodyDensity } from './body-density';
import { netBraceDepth } from './net-brace-depth';

/**
 * Counts one module's comment and code lines inside bodies.
 *
 * A line is classified before it can change the depth, so the brace that opens
 * a body belongs to the code outside it and the first line of the body is the
 * first line counted. That is what makes a struct's per-member JSDoc count
 * while the block above the struct does not, which is the distinction the
 * standard rests on.
 *
 * @param text - The module's full source
 * @returns The lines inside bodies, split into comments and code
 */
export function measureBodyDensity(text: string): BodyDensity {
  let comments = 0;
  let code = 0;
  let depth = 0;
  let inBlock = false;

  for (const line of text.split('\n')) {
    const trimmed = line.trim();

    // The depth at the start of the line decides whether the line is inside a
    // body, so it is read before any brace on the line is counted.
    const startDepth = depth;
    const isBlank = trimmed === '';
    const isComment =
      inBlock || trimmed.startsWith('//') || trimmed.startsWith('/*');

    // A block comment runs until its closing marker, which may be this line.
    if (inBlock) {
      if (trimmed.includes('*/')) {
        inBlock = false;
      }
    } else if (trimmed.startsWith('/*') && !trimmed.includes('*/')) {
      inBlock = true;
    }

    // Only a code line can open or close a body. A depth below zero means the
    // scan lost its place, and clamping keeps one odd line from skewing the
    // rest of the module.
    if (!isComment && !isBlank) {
      depth += netBraceDepth(line);
      if (depth < 0) {
        depth = 0;
      }
    }

    // Outside a body, and blank anywhere, a line is in neither count.
    if (startDepth < 1 || isBlank) {
      continue;
    }
    if (isComment) {
      comments += 1;
    } else {
      code += 1;
    }
  }

  const density: BodyDensity = { code, comments };
  return density;
}
