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
      return toFetchError('Redirects are not allowed for unit artwork', 400);
    }

    if (!response.ok) {
      return toFetchError(
        `Failed to fetch unit artwork (${response.status} ${response.statusText})`,
      );
    }

    const contentLength = response.headers.get('content-length');
    if (
      typeof contentLength === 'string' &&
      Number(contentLength) > MAX_ARTWORK_BYTES
    ) {
      return toFetchError('Unit artwork exceeds size limit', 400);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > MAX_ARTWORK_BYTES) {
      return toFetchError('Unit artwork exceeds size limit', 400);
    }

    await writeFile(destinationPath, buffer);
    return { success: true, data: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch unit artwork';
    return toFetchError(message);
  }
};

export { fetchUnitArtwork };
