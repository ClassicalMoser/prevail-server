import { contentTypeFor } from './content-type-for';

describe('contentTypeFor function', () => {
  it('maps svg assets to image/svg+xml', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const type = contentTypeFor('svg');

    expect(type).toBe('image/svg+xml');
  });

  it('maps bleed pdf assets to application/pdf', { timeout: 5000 }, () => {
    expect.hasAssertions();

    const type = contentTypeFor('pdf-bleed');

    expect(type).toBe('application/pdf');
  });
});
