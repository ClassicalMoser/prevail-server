import { toContractCardListItem } from './to-contract-card-list-item';

describe('toContractCardListItem function', () => {
  it(
    'keeps only the id, name, and version from the catalog row',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const item = toContractCardListItem({
        id: 'card-1',
        name: 'Charge',
        version: '1.0.0',
      });

      expect(item).toStrictEqual({
        id: 'card-1',
        name: 'Charge',
        version: '1.0.0',
      });
    },
  );
});
