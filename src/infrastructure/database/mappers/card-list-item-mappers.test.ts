import { commandCardListItemMapper } from './command-card-list-item';
import { unitCardListItemMapper } from './unit-card-list-item';

describe('commandCardListItemMapper function', () => {
  it(
    'formats a present version triple and leaves a missing version null',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const versioned = commandCardListItemMapper({
        command_card_id: 'card-1',
        command_card_name: 'Advance',
        version_major: 1,
        version_minor: null,
        version_patch: 2,
      });
      const unversioned = commandCardListItemMapper({
        command_card_id: 'card-2',
        command_card_name: null,
        version_major: null,
        version_minor: null,
        version_patch: null,
      });

      expect(versioned).toStrictEqual({
        id: 'card-1',
        name: 'Advance',
        version: '1.0.2',
      });
      expect(unversioned).toStrictEqual({
        id: 'card-2',
        name: null,
        version: null,
      });
    },
  );
});

describe('unitCardListItemMapper function', () => {
  it('formats the version columns this test set', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const item = unitCardListItemMapper({
      unit_card_id: 'unit-1',
      unit_card_name: 'Hastati',
      version_major: 4,
      version_minor: 5,
      version_patch: 6,
    });

    expect(item).toStrictEqual({
      id: 'unit-1',
      name: 'Hastati',
      version: '4.5.6',
    });
  });
});
