import { certifyCardVersions } from './certify-card-versions';

describe('certifyCardVersions function', () => {
  it(
    'certifies schema-valid cards whose assets already exist',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // Records what is written to certify, since the write is what players rely on.
      const certifiedIds: string[] = [];
      // Three latest cards: one ready and uncertified, one already certified, one the schema rejects. Every asset exists, so none needs healing.
      const result = await certifyCardVersions({
        allAssetsExist: async () => true,
        cardId: (card) => card.id,
        certify: async (ids) => {
          certifiedIds.push(...ids);
          return { data: undefined, success: true };
        },
        ensureProjection: async () => ({ data: undefined, success: true }),
        getLatest: async () => ({
          data: [
            { card: { id: 'ready' }, certified: false },
            { card: { id: 'already' }, certified: true },
            { card: { id: 'invalid' }, certified: false },
          ],
          success: true,
        }),
        isSchemaValid: (card) => card.id !== 'invalid',
        prepare: async () => ({ data: undefined, success: true }),
      });

      // Only the ready card is written: the certified one is skipped and the schema-invalid one never certified.
      expect(certifiedIds).toStrictEqual(['ready']);
      // The report comes from the stubbed read, which never changes, so 'ready' still shows as uncertified here; the write above is the fact under test.
      expect(result).toStrictEqual({
        data: {
          certified: ['already'],
          uncertified: ['ready', 'invalid'],
        },
        success: true,
      });
    },
  );

  it(
    'heals missing assets before collecting ids to certify',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      // Records which cards had their assets re-drawn.
      const healed: string[] = [];
      // No card has its assets at first, so the card must be healed before it can be certified.
      const exists = new Set<string>();
      const result = await certifyCardVersions({
        allAssetsExist: async (card) => exists.has(card.id),
        cardId: (card) => card.id,
        certify: async () => ({ data: undefined, success: true }),
        ensureProjection: async (card) => {
          healed.push(card.id);
          exists.add(card.id);
          return { data: undefined, success: true };
        },
        getLatest: async () => ({
          data: [
            {
              card: { id: 'needs-heal' },
              certified: exists.has('needs-heal'),
            },
          ],
          success: true,
        }),
        isSchemaValid: () => true,
        prepare: async () => ({ data: undefined, success: true }),
      });

      // The card was healed once, and then (its assets now existing) it reads as certified in the final report.
      expect(healed).toStrictEqual(['needs-heal']);
      expect(result).toStrictEqual({
        data: {
          certified: ['needs-heal'],
          uncertified: [],
        },
        success: true,
      });
    },
  );
});
