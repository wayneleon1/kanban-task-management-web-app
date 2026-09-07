import { HttpErrorResponse } from '@angular/common/http';

/** Prefers the backend's structured `{ status: 'error', message }` body over a generic status message. */
export function extractErrorMessage(err: HttpErrorResponse): string {
  if (err.status === 0) {
    return 'Cannot reach the server. Please check your connection and try again.';
  }
  const backendMessage = (err.error as { message?: string } | null)?.message;
  return backendMessage ?? `Server error ${err.status}: ${err.message}`;
}
