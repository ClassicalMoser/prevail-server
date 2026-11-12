import { jsonSuccessContentType } from './json-success-content-type';

describe('jsonSuccessContentType constant', () => {
  it('is application/json', { timeout: 5000 }, () => {
    expect.hasAssertions();

    // Routes default to JSON unless their contract names a media type.
    expect(jsonSuccessContentType).toBe('application/json');
  });
});
