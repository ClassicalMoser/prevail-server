import { certifyCardVersions } from './certify-card-versions';

describe('certifyCardVersions function', () => {
  it(
    'certifies schema-valid cards whose assets already exist',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const certifiedIds: string[] = [];
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
      });

      expect(certifiedIds).toStrictEqual(['ready']);
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

      const healed: string[] = [];
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
      });

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
