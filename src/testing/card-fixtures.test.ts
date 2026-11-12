import { certificationStatus, commandCardNamingUnits } from './card-fixtures';

describe('card fixtures', () => {
  it('has a command card that names unit types', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // The fixture is a command card whose support names unit types, the case
    // other specs need and the sample catalog does not give.
    expect(commandCardNamingUnits.unitSupport.supportType).toBe('unitType');
  });

  it('pairs a card with its certified flag', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // Pairs a card with a certified flag, the shape the certification query
    // returns.
    expect(certificationStatus('card', true)).toStrictEqual({
      card: 'card',
      certified: true,
    });
  });
});
