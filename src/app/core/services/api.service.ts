import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { catchError, shareReplay, takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Board } from '../models/board.model';
import { extractErrorMessage } from '../utils/http-error.util';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  // ── Cache control ────────────────────────────────────────────────────────
  // bustCache$ emits whenever a mutation completes, invalidating the
  // shareReplay cache so the next getBoards() call hits the network.
  private bustCache$ = new Subject<void>();
  private boards$: Observable<Board[]> | null = null;

  // ── Boards ───────────────────────────────────────────────────────────────

  /**
   * GET /boards
   * Returns a cached observable. Multiple subscribers within the same
   * load cycle share a single HTTP request (shareReplay).
   * Cache is cleared automatically after any mutation via bustCache().
   */
  getBoards(): Observable<Board[]> {
    if (!this.boards$) {
      this.boards$ = this.http
        .get<Board[]>(`${this.base}/boards`)
        .pipe(shareReplay(1), takeUntil(this.bustCache$), catchError(this.handleError));
    }
    return this.boards$;
  }

  /** GET /boards/:id */
  getBoardById(id: string): Observable<Board> {
    return this.http.get<Board>(`${this.base}/boards/${id}`).pipe(catchError(this.handleError));
  }

  /** POST /boards */
  createBoard(board: Board): Observable<Board> {
    return this.http.post<Board>(`${this.base}/boards`, board).pipe(catchError(this.handleError));
  }

  /**
   * PUT /boards/:id
   * Used for all board edits AND nested task mutations (add/update/delete/toggle).
   * Busts the getBoards() cache after success so the next load reflects changes.
   */
  updateBoard(board: Board): Observable<Board> {
    return this.http
      .put<Board>(`${this.base}/boards/${board.id}`, board)
      .pipe(catchError(this.handleError));
  }

  /** DELETE /boards/:id */
  deleteBoard(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/boards/${id}`).pipe(catchError(this.handleError));
  }

  /**
   * Invalidates the getBoards() cache.
   * Called by effects after any successful mutation so a fresh reload
   * always fetches updated data from the server.
   */
  bustCache(): void {
    this.boards$ = null;
    this.bustCache$.next();
  }

  // ── Error Handler ────────────────────────────────────────────────────────

  private handleError(err: HttpErrorResponse): Observable<never> {
    const message = extractErrorMessage(err);
    console.error('[ApiService]', message, err);
    return throwError(() => new Error(message));
  }
}
