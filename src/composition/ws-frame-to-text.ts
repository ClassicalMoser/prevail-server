/**
 * Read a socket frame as UTF-8 text.
 *
 * The `ws` library hands a message over as one buffer, a list of fragments, or
 * an array buffer, depending on how the client framed it. Every route reads
 * text, so the shapes are joined here.
 *
 * @param raw - The frame as the socket delivered it.
 * @returns The frame's text.
 */
const wsFrameToText = (raw: Buffer | ArrayBuffer | Buffer[]): string => {
  if (Buffer.isBuffer(raw)) {
    return raw.toString('utf8');
  }
  if (Array.isArray(raw)) {
    return Buffer.concat(raw).toString('utf8');
  }
  return Buffer.from(raw).toString('utf8');
};

export { wsFrameToText };
