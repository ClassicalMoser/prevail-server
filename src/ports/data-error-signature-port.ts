interface DataSignature<T> {
  success: true;
  data: T;
}

interface ErrorSignature {
  success: false;
  message: string;
  code: string;
}

type DataErrorSignature<T> = DataSignature<T> | ErrorSignature;

export type { DataSignature, ErrorSignature, DataErrorSignature };
