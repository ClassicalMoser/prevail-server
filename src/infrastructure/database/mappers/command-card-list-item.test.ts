import { commandCardListItemMapper } from './command-card-list-item';

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
