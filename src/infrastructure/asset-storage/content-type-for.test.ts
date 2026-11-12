import { contentTypeFor } from './content-type-for';

describe('contentTypeFor function', () => {
  it('maps svg assets to image/svg+xml', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // A card rendered as SVG is served as an image.
    const type = contentTypeFor('svg');

    expect(type).toBe('image/svg+xml');
  });

  it('maps bleed pdf assets to application/pdf', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // The print-bleed card is also a PDF, so it shares the PDF content type.
    const type = contentTypeFor('pdf-bleed');

    expect(type).toBe('application/pdf');
  });
});
