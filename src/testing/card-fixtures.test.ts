import { certificationStatus, commandCardNamingUnits } from './card-fixtures';

describe('card fixtures', () => {
  it('has a command card that names unit types', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(commandCardNamingUnits.unitSupport.supportType).toBe('unitType');
  });

  it('pairs a card with its certified flag', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(certificationStatus('card', true)).toStrictEqual({
      card: 'card',
      certified: true,
    });
  });
});
