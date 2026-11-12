import { resolveCardRendererAssetsDir } from './resolve-card-renderer-assets-dir';

describe('resolveCardRendererAssetsDir function', () => {
  it('uses the configured directory, made absolute', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(resolveCardRendererAssetsDir('/srv/assets', '/app')).toBe(
      '/srv/assets',
    );
  });

  it(
    'defaults to card-renderer under the working directory',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      expect(resolveCardRendererAssetsDir(undefined, '/app')).toBe(
        '/app/card-renderer',
      );
    },
  );

  it('treats an empty setting as unset', { timeout: 5000 }, () => {
    expect.hasAssertions();

    expect(resolveCardRendererAssetsDir('', '/app')).toBe('/app/card-renderer');
  });
});
