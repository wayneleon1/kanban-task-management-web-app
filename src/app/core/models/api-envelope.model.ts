export interface ApiEnvelope<T> {
  status: 'success' | 'error';
  data: T;
}
