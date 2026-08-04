import { S3Client } from '@aws-sdk/client-s3';

interface R2ClientConfig {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
}

const createR2Client = (config: R2ClientConfig): S3Client =>
  new S3Client({
    region: 'auto',
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

export type { R2ClientConfig };
export { createR2Client };
