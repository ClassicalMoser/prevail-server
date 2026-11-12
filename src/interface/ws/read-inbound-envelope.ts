/** An inbound socket message split into its tag and payload, or why not. */
type InboundEnvelope =
  | { ok: true; type: string; payload: unknown }
  | { ok: false; errorReason: 'Invalid JSON' | 'Invalid inbound message' };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Parse a raw socket message as a tagged `{ type, payload }` envelope.
 *
 * The payload is left unknown; each route checks it with the contract schema
 * for that type.
 *
 * @param raw - Text frame from the socket.
 * @returns The envelope's type and payload, or the reason it was refused.
 */
const readInboundEnvelope = (raw: string): InboundEnvelope => {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    const invalidJson: InboundEnvelope = {
      errorReason: 'Invalid JSON',
      ok: false,
    };
    return invalidJson;
  }
  if (!isRecord(value) || typeof value.type !== 'string') {
    const invalid: InboundEnvelope = {
      errorReason: 'Invalid inbound message',
      ok: false,
    };
    return invalid;
  }
  const envelope: InboundEnvelope = {
    ok: true,
    payload: value.payload,
    type: value.type,
  };
  return envelope;
};

export type { InboundEnvelope };
export { readInboundEnvelope };
