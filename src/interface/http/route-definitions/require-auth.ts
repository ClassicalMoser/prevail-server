import type { ErrorSignature, RequestAuth } from '@ports';

const missingAuth: ErrorSignature = {
  success: false,
  message: 'Unauthorized',
  status: 401,
};

const requireSubject = (auth: RequestAuth | undefined): string | undefined => {
  if (auth === undefined) {
    return undefined;
  }
  return auth.subject;
};

export { missingAuth, requireSubject };
