import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Board } from '../models/board.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  // Base URL pulled from the environment file.
  private base = environment.apiUrl;

  // ── Boards ──────────────────────────────────────────────────────────────

  /**
   * GET /boards
   * Fetches all boards. shareReplay(1) caches the last emission so multiple
   * subscribers (e.g. sidebar + board-detail) don't trigger duplicate requests.
   */
  getBoards(): Observable<Board[]> {
    return this.http
      .get<Board[]>(`${this.base}/boards`)
      .pipe(shareReplay(1), catchError(this.handleError));
  }

  /**
   * GET /boards/:id
   * Fetches a single board by ID.
   */
  getBoardById(id: string): Observable<Board> {
    return this.http.get<Board>(`${this.base}/boards/${id}`).pipe(catchError(this.handleError));
  }

  /**
   * POST /boards
   * Creates a new board. The full Board object (with generated IDs) is sent
   * from the Effect before calling this method.
   */
  createBoard(board: Board): Observable<Board> {
    return this.http.post<Board>(`${this.base}/boards`, board).pipe(catchError(this.handleError));
  }

  /**
   * PUT /boards/:id
   * Replaces the entire board document — used for updates (name, columns)
   * and for any task mutation (add / edit / delete / toggle subtask) since
   * json-server stores tasks nested inside the board.
   */
  updateBoard(board: Board): Observable<Board> {
    return this.http
      .put<Board>(`${this.base}/boards/${board.id}`, board)
      .pipe(catchError(this.handleError));
  }

  /**
   * DELETE /boards/:id
   * Removes the board document entirely.
   */
  deleteBoard(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/boards/${id}`).pipe(catchError(this.handleError));
  }

  // ── Error Handler ────────────────────────────────────────────────────────

  /**
   * Centralised error handler.
   * Converts HttpErrorResponse into a plain string message that NgRx
   * failure actions (e.g. loadBoardsFailure) can carry in their `error` prop.
   */
  private handleError(err: HttpErrorResponse): Observable<never> {
    let message: string;

    if (err.status === 0) {
      // Network error or server unreachable (e.g. json-server not running)
      message = 'Cannot reach the server. Is json-server running on port 3000?';
    } else {
      // HTTP error returned by the server (4xx / 5xx)
      message = `Server error ${err.status}: ${err.message}`;
    }

    console.error('[ApiService]', message, err);
    return throwError(() => new Error(message));
  }
}
