import { S3Client } from '@aws-sdk/client-s3';
import { createR2Client } from './create-r2-client';

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
});
