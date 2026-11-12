import { replaceUnitSupportIdWithName } from './replace-unit-support-id-with-name';

describe('replaceUnitSupportIdWithName function', () => {
  it('shows a supported unit type by name', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const support = {
      count: 1,
      supportType: 'unitType',
      unitTypeId: 'u1',
    } as const;

    expect(
      replaceUnitSupportIdWithName(support, new Map([['u1', 'Hastati']])),
    ).toStrictEqual({
      count: 1,
      supportType: 'unitType',
      unitTypeId: 'Hastati',
    });
  });

  it('leaves generic support as it is', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const support = { count: 1, supportType: 'generic' } as const;

    expect(replaceUnitSupportIdWithName(support, new Map())).toStrictEqual(
      support,
    );
  });
});
