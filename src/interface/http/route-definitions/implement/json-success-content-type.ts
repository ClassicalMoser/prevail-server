/**
 * Contract-driven route registration.
 *
 * `implement*Route` helpers derive path, auth, method, and request parsing
 * from the contract validators so handlers only wire use-case calls.
 */

const jsonSuccessContentType = 'application/json' as const;

export { jsonSuccessContentType };
