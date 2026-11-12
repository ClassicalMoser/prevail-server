import { measureScopes } from './measure-scopes';

describe('measureScopes function', () => {
  it(
    'measures each boundary that has files, without the @',
    { timeout: 20_000 },
    async () => {
      expect.hasAssertions();

      const measured = await measureScopes();
      const scopes = measured.map((entry) => entry.scope);

      expect(scopes).toContain('application');
      expect(scopes).not.toContain('@application');
    },
  );

  it('reports source and specs apart', { timeout: 20_000 }, async () => {
    expect.hasAssertions();

    const measured = await measureScopes();
    const application = measured.find((entry) => entry.scope === 'application');

    expect(application?.specs.code).toBeGreaterThan(0);
    expect(application?.source.code).toBeGreaterThan(0);
  });
});
