import { unitCardListItemMapper } from './unit-card-list-item';

describe('unitCardListItemMapper function', () => {
  it('formats the version columns this test set', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // Version columns 4, 5, 6.
    const item = unitCardListItemMapper({
      unit_card_id: 'unit-1',
      unit_card_name: 'Hastati',
      version_major: 4,
      version_minor: 5,
      version_patch: 6,
    });

    // The list item shows them as one dotted version.
    expect(item).toStrictEqual({
      id: 'unit-1',
      name: 'Hastati',
      version: '4.5.6',
    });
  });
});
