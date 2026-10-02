import { writeFile } from 'node:fs/promises';
import type { DataErrorSignature } from '@ports';
import { assertAllowedMediaOrigin } from './assert-allowed-media-origin';

const MAX_ARTWORK_BYTES = 10 * 1024 * 1024;

const toFetchError = (
  message: string,
  status = 500,
): DataErrorSignature<boolean> => ({
  success: false,
  message,
  status,
});

/**
 * Download unit artwork into the Typst workspace after origin checks.
 *
 * Redirects are rejected. Bodies over 10 MiB fail with 400. On success the
 * boolean data is `true` so the renderer can set `unitImage` in details.
 *
 * @param imageUrl - Absolute artwork URL from the unit type.
 * @param destinationPath - Path inside the render workspace to write.
 * @param allowedMediaOrigin - Origin allowlist from process env.
 * @returns Success with `data: true`, or an error envelope.
 */
const fetchUnitArtwork = async (
  imageUrl: string,
  destinationPath: string,
  allowedMediaOrigin: string,
): Promise<DataErrorSignature<boolean>> => {
  const originResult = assertAllowedMediaOrigin(imageUrl, allowedMediaOrigin);
  if (!originResult.success) {
    return originResult;
  }

  try {
    const response = await fetch(imageUrl, { redirect: 'manual' });
    if (response.status >= 300 && response.status < 400) {
      const redirectRejected = toFetchError(
        'Redirects are not allowed for unit artwork',
        400,
      );
      return redirectRejected;
    }

    if (!response.ok) {
      const fetchFailed = toFetchError(
        `Failed to fetch unit artwork (${response.status} ${response.statusText})`,
      );
      return fetchFailed;
    }

    const contentLength = response.headers.get('content-length');
    if (
      typeof contentLength === 'string' &&
      Number(contentLength) > MAX_ARTWORK_BYTES
    ) {
      const tooLargeHeader = toFetchError(
        'Unit artwork exceeds size limit',
        400,
      );
      return tooLargeHeader;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > MAX_ARTWORK_BYTES) {
      const tooLargeBody = toFetchError('Unit artwork exceeds size limit', 400);
      return tooLargeBody;
    }

    await writeFile(destinationPath, buffer);
    return { success: true, data: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch unit artwork';
    const fetchError = toFetchError(message);
    return fetchError;
  }
};

export { fetchUnitArtwork };
