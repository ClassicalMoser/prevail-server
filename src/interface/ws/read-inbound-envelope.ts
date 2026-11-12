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
  // A client can send any text; unparseable JSON is a refusal to that client,
  // not a throw in the message loop.
  try {
    value = JSON.parse(raw);
  } catch {
    const invalidJson: InboundEnvelope = {
      errorReason: 'Invalid JSON',
      ok: false,
    };
    return invalidJson;
  }
  // Every message must carry a string type, so the route can pick its handler;
  // the payload is checked later, against that type's schema.
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
