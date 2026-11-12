import { resolveCardRendererAssetsDir } from './resolve-card-renderer-assets-dir';

describe('resolveCardRendererAssetsDir function', () => {
  it('uses the configured directory, made absolute', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // An absolute setting is used as is, whatever the working directory.
    expect(resolveCardRendererAssetsDir('/srv/assets', '/app')).toBe(
      '/srv/assets',
    );
  });

  it(
    'defaults to card-renderer under the working directory',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      // With no setting, the assets are expected inside the app directory.
      expect(resolveCardRendererAssetsDir(undefined, '/app')).toBe(
        '/app/card-renderer',
      );
    },
  );

  it('treats an empty setting as unset', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // An empty setting is the same as none.
    expect(resolveCardRendererAssetsDir('', '/app')).toBe('/app/card-renderer');
  });
});
