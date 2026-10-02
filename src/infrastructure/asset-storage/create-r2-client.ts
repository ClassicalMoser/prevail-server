import { S3Client } from '@aws-sdk/client-s3';

interface R2ClientConfig {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
}

/**
 * Build an S3 client pointed at Cloudflare R2.
 *
 * Region is fixed to `auto` as R2 requires. Credentials come from the process
 * env wiring in composition, not from instance profiles.
 *
 * @param config - Endpoint and access key pair for the R2 bucket account.
 * @returns An AWS SDK v3 S3 client.
 */
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
