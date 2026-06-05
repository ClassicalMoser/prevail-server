interface DataSignature<T> {
  success: true;
  data: T;
}

interface ErrorSignature {
  success: false;
  message: string;
  status: number;
}

type DataErrorSignature<T> = DataSignature<T> | ErrorSignature;

export type { DataSignature, ErrorSignature, DataErrorSignature };
