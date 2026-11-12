import { requireEnv } from './require-env';

/**
 * Read the one origin unit-card artwork may be loaded from.
 *
 * Unit cards render an image by URL, so the renderer is only allowed to fetch
 * from this origin; an author cannot point a card at an arbitrary host.
 *
 * @param env - The process environment.
 * @returns The `ALLOWED_MEDIA_ORIGIN` value, checked to be a URL.
 */
const readAllowedMediaOrigin = (
  env: Readonly<Record<string, string | undefined>>,
): string => {
  const origin = requireEnv(env, 'ALLOWED_MEDIA_ORIGIN');
  // Fail at startup on a typo, not later when a unit-card preview is refused.
  if (!URL.canParse(origin)) {
    throw new Error('ALLOWED_MEDIA_ORIGIN must be a valid URL origin');
  }
  return origin;
};

export { readAllowedMediaOrigin };
