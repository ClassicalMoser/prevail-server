import { renderDetailsForAssetType } from './render-details-for-asset-type';

describe('renderDetailsForAssetType function', () => {
  it('maps svg to an svg render without bleed', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const details = renderDetailsForAssetType('svg');

    expect(details).toStrictEqual({
      bleed: false,
      format: 'svg',
      unitImage: false,
    });
  });

  it('maps pdf-bleed to a pdf render with bleed', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const details = renderDetailsForAssetType('pdf-bleed');

    expect(details).toStrictEqual({
      bleed: true,
      format: 'pdf',
      unitImage: false,
    });
  });
});
