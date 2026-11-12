/**
 * How far one line opens or closes a body.
 *
 * Braces inside a string or a comment are text, not structure, so the scan
 * walks the line rather than counting characters: a coordinate such as
 * `'{E-5}'` or a brace mentioned in a trailing comment would otherwise move
 * the depth and misplace every line after it.
 *
 * @param line - One line of TypeScript
 * @returns The net change in brace depth, positive when the line opens a body
 */
export function netBraceDepth(line: string): number {
  let depth = 0;
  let quote = '';
  let index = 0;

  // A manual index rather than a for-of, because an escape has to advance two
  // characters at once and a loop over characters cannot skip ahead.
  while (index < line.length) {
    // `charAt` rather than an index, which under this project's strict settings
    // would be `string | undefined` and need a guard on every comparison.
    const char = line.charAt(index);

    // Inside a string nothing counts, and a backslash hides the next character.
    if (quote !== '') {
      // A backslash hides whatever follows it, including the closing quote,
      // so both characters are consumed together.
      if (char === '\\') {
        index += 2;
        continue;
      }
      if (char === quote) {
        quote = '';
      }
      index += 1;
      continue;
    }

    // A line comment ends the scan: everything after it is prose.
    if (char === '/' && line.charAt(index + 1) === '/') {
      break;
    }

    // A block comment is skipped when it closes on this line, and ends the scan
    // when it does not, because the rest of the line is prose too.
    if (char === '/' && line.charAt(index + 1) === '*') {
      const close = line.indexOf('*/', index + 2);

      // An unterminated block runs past the end of this line, so there is
      // nothing further on it to count. The caller classified the line
      // already, so stopping here loses nothing.
      if (close === -1) {
        break;
      }
      index = close + 2;
      continue;
    }

    // Outside a string and a comment, a quote opens one and a brace counts.
    if (char === '"' || char === "'" || char === '`') {
      quote = char;
    } else if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
    }
    index += 1;
  }

  // The result can be negative, on a line that closes more than it opens. The
  // caller clamps a running depth rather than this one, so a closing brace
  // still cancels the brace that opened the body.
  return depth;
}
