import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, Subject, catchError, map, shareReplay, takeUntil, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ActivityEntry } from '../models/activity.model';
import { ApiEnvelope } from '../models/api-envelope.model';
import { Board, Column, Task } from '../models/board.model';
import {
  ActivityDto,
  BoardDto,
  ColumnDto,
  TaskDto,
  mapActivity,
  mapBoard,
  mapColumn,
  mapTask,
} from '../utils/board-mapper.util';
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
      this.boards$ = this.http.get<ApiEnvelope<{ boards: BoardDto[] }>>(`${this.base}/boards`).pipe(
        map((res) => res.data.boards.map(mapBoard)),
        shareReplay(1),
        takeUntil(this.bustCache$),
        catchError(this.handleError),
      );
    }
    return this.boards$;
  }

  createBoard(name: string): Observable<Board> {
    return this.http.post<ApiEnvelope<{ board: BoardDto }>>(`${this.base}/boards`, { name }).pipe(
      map((res) => mapBoard(res.data.board)),
      catchError(this.handleError),
    );
  }

  updateBoardName(boardId: string, name: string): Observable<Board> {
    return this.http
      .put<ApiEnvelope<{ board: BoardDto }>>(`${this.base}/boards/${boardId}`, { name })
      .pipe(
        map((res) => mapBoard(res.data.board)),
        catchError(this.handleError),
      );
  }

  getActivity(boardId: string): Observable<ActivityEntry[]> {
    return this.http
      .get<ApiEnvelope<{ activity: ActivityDto[] }>>(`${this.base}/boards/${boardId}/activity`)
      .pipe(
        map((res) => res.data.activity.map(mapActivity).filter((a): a is ActivityEntry => !!a)),
        catchError(this.handleError),
      );
  }

  deleteBoard(boardId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/boards/${boardId}`).pipe(catchError(this.handleError));
  }

  // ── Collaborators ────────────────────────────────────────────────────────
  // Responses carry only owner/collaborators (no nested columns/tasks) —
  // callers must merge into existing board state rather than replacing it.

  addCollaborator(boardId: string, email: string, role: 'viewer' | 'editor'): Observable<Board> {
    return this.http
      .post<ApiEnvelope<{ board: BoardDto }>>(`${this.base}/boards/${boardId}/collaborators`, {
        email,
        role,
      })
      .pipe(
        map((res) => mapBoard(res.data.board)),
        catchError(this.handleError),
      );
  }

  updateCollaboratorRole(
    boardId: string,
    userId: string,
    role: 'viewer' | 'editor',
  ): Observable<Board> {
    return this.http
      .put<ApiEnvelope<{ board: BoardDto }>>(
        `${this.base}/boards/${boardId}/collaborators/${userId}`,
        { role },
      )
      .pipe(
        map((res) => mapBoard(res.data.board)),
        catchError(this.handleError),
      );
  }

  removeCollaborator(boardId: string, userId: string): Observable<Board> {
    return this.http
      .delete<ApiEnvelope<{ board: BoardDto }>>(
        `${this.base}/boards/${boardId}/collaborators/${userId}`,
      )
      .pipe(
        map((res) => mapBoard(res.data.board)),
        catchError(this.handleError),
      );
  }

  // ── Columns ──────────────────────────────────────────────────────────────

  createColumn(boardId: string, name: string): Observable<Column> {
    return this.http
      .post<ApiEnvelope<{ column: ColumnDto }>>(`${this.base}/boards/${boardId}/columns`, { name })
      .pipe(
        map((res) => mapColumn(res.data.column)),
        catchError(this.handleError),
      );
  }

  updateColumn(columnId: string, updates: { name?: string; color?: string }): Observable<Column> {
    return this.http
      .put<ApiEnvelope<{ column: ColumnDto }>>(`${this.base}/columns/${columnId}`, updates)
      .pipe(
        map((res) => mapColumn(res.data.column)),
        catchError(this.handleError),
      );
  }

  deleteColumn(columnId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/columns/${columnId}`).pipe(catchError(this.handleError));
  }

  reorderColumns(boardId: string, columnIds: string[]): Observable<Column[]> {
    return this.http
      .put<ApiEnvelope<{ columns: ColumnDto[] }>>(`${this.base}/boards/${boardId}/columns/reorder`, {
        columnIds,
      })
      .pipe(
        map((res) => res.data.columns.map(mapColumn)),
        catchError(this.handleError),
      );
  }

  // ── Tasks ────────────────────────────────────────────────────────────────

  getTask(taskId: string): Observable<Task> {
    return this.http.get<ApiEnvelope<{ task: TaskDto }>>(`${this.base}/tasks/${taskId}`).pipe(
      map((res) => mapTask(res.data.task)),
      catchError(this.handleError),
    );
  }

  createTask(
    columnId: string,
    input: {
      title: string;
      description?: string;
      dueDate?: string;
      assignedTo?: string;
      subtasks?: { title: string }[];
    },
  ): Observable<Task> {
    return this.http
      .post<ApiEnvelope<{ task: TaskDto }>>(`${this.base}/tasks`, { columnId, ...input })
      .pipe(
        map((res) => mapTask(res.data.task)),
        catchError(this.handleError),
      );
  }

  updateTask(taskId: string, updates: Record<string, unknown>): Observable<Task> {
    return this.http.put<ApiEnvelope<{ task: TaskDto }>>(`${this.base}/tasks/${taskId}`, updates).pipe(
      map((res) => mapTask(res.data.task)),
      catchError(this.handleError),
    );
  }

  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/tasks/${taskId}`).pipe(catchError(this.handleError));
  }

  // ── Subtasks ─────────────────────────────────────────────────────────────

  addSubtask(taskId: string, title: string): Observable<Task> {
    return this.http
      .post<ApiEnvelope<{ task: TaskDto }>>(`${this.base}/tasks/${taskId}/subtasks`, { title })
      .pipe(
        map((res) => mapTask(res.data.task)),
        catchError(this.handleError),
      );
  }

  renameSubtask(taskId: string, subtaskId: string, title: string): Observable<Task> {
    return this.http
      .put<ApiEnvelope<{ task: TaskDto }>>(`${this.base}/tasks/${taskId}/subtasks/${subtaskId}`, {
        title,
      })
      .pipe(
        map((res) => mapTask(res.data.task)),
        catchError(this.handleError),
      );
  }

  deleteSubtask(taskId: string, subtaskId: string): Observable<Task> {
    return this.http
      .delete<ApiEnvelope<{ task: TaskDto }>>(`${this.base}/tasks/${taskId}/subtasks/${subtaskId}`)
      .pipe(
        map((res) => mapTask(res.data.task)),
        catchError(this.handleError),
      );
  }

  toggleSubtask(taskId: string, subtaskId: string): Observable<Task> {
    return this.http
      .patch<ApiEnvelope<{ task: TaskDto }>>(
        `${this.base}/tasks/${taskId}/subtasks/${subtaskId}/toggle`,
        {},
      )
      .pipe(
        map((res) => mapTask(res.data.task)),
        catchError(this.handleError),
      );
  }

  /**
   * Invalidates the getBoards() cache.
   * Called after any successful mutation so the next load reflects changes.
   */
  bustCache(): void {
    this.boards$ = null;
    this.bustCache$.next();
  }

  // ── Error Handler ────────────────────────────────────────────────────────

  private handleError = (err: Parameters<typeof extractErrorMessage>[0]): Observable<never> => {
    const message = extractErrorMessage(err);
    console.error('[ApiService]', message, err);
    return throwError(() => new Error(message));
  };
}
