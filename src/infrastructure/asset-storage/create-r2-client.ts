import { S3Client } from '@aws-sdk/client-s3';

/** Endpoint and credentials for the Cloudflare R2 account holding card assets. */
interface R2ClientConfig {
  /** The account's S3-compatible R2 endpoint URL. */
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
 * Checksums stay `WHEN_REQUIRED`. The SDK default, `WHEN_SUPPORTED`, sends
 * `x-amz-checksum-mode: ENABLED` on `HeadObject`. R2 does not answer that
 * request, so certification's existence checks never return even when the
 * objects were uploaded successfully.
 *
 * @param config - Endpoint and access key pair for the R2 bucket account.
 * @returns An AWS SDK v3 S3 client.
 */
const createR2Client = (config: R2ClientConfig): S3Client => {
  const client = new S3Client({
    // R2 has no regions; 'auto' is the value it accepts.
    region: 'auto',
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  });
  return client;
};

export type { R2ClientConfig };
export { createR2Client };
