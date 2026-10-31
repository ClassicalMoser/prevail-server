import { S3Client } from '@aws-sdk/client-s3';
import { createR2Client } from './create-r2-client';

/**
 * Read a checksum mode the SDK stores either as a string or as a provider.
 *
 * @param mode - One checksum field from `S3Client.config`.
 * @returns The resolved mode.
 */
const checksumMode = async (
  mode:
    | S3Client['config']['requestChecksumCalculation']
    | S3Client['config']['responseChecksumValidation'],
): Promise<string> => {
  if (typeof mode === 'function') {
    const resolved = await mode();
    return resolved;
  }
  return mode;
};

describe('createR2Client function', () => {
  it(
    'builds an S3 client pointed at the R2 endpoint this test set',
    { timeout: 5000 },
    () => {
      expect.hasAssertions();

      const client = createR2Client({
        accessKeyId: 'key',
        endpoint: 'https://r2.example',
        secretAccessKey: 'secret',
      });

      expect(client).toBeInstanceOf(S3Client);
      expect(client.config.endpoint).toBeDefined();
    },
  );

  it(
    'asks R2 for checksums only when the operation requires them',
    { timeout: 5000 },
    async () => {
      expect.hasAssertions();

      const client = createR2Client({
        accessKeyId: 'key',
        endpoint: 'https://r2.example',
        secretAccessKey: 'secret',
      });
      const requestMode = await checksumMode(
        client.config.requestChecksumCalculation,
      );
      const responseMode = await checksumMode(
        client.config.responseChecksumValidation,
      );

      expect(requestMode).toBe('WHEN_REQUIRED');
      expect(responseMode).toBe('WHEN_REQUIRED');
    },
  );
});
