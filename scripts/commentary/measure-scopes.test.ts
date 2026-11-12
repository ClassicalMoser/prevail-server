import { measureScopes } from './measure-scopes';

describe('measureScopes function', () => {
  it(
    'measures each boundary that has files, without the @',
    { timeout: 20_000 },
    async () => {
      expect.hasAssertions();

      // This measures the real repository, which has files in the application
      // scope.
      const measured = await measureScopes();
      const scopes = measured.map((entry) => entry.scope);

      // The application layer is reported.
      expect(scopes).toContain('application');
      // The scope name drops the @ that the boundary configuration uses.
      expect(scopes).not.toContain('@application');
    },
  );

  it('reports source and specs apart', { timeout: 20_000 }, async () => {
    expect.hasAssertions();

    const measured = await measureScopes();
    // Source and specs are counted apart.
    const application = measured.find((entry) => entry.scope === 'application');

    // The application specs have code lines.
    expect(application?.specs.code).toBeGreaterThan(0);
    // The application source has code lines.
    expect(application?.source.code).toBeGreaterThan(0);
  });
});
