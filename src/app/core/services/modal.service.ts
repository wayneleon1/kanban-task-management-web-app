import { Injectable, signal } from '@angular/core';

export type ModalType =
  | 'view-task'
  | 'add-task'
  | 'edit-task'
  | 'delete-task'
  | 'add-board'
  | 'edit-board'
  | 'delete-board'
  | 'add-column'
  | 'rename-column'
  | 'delete-column'
  | 'manage-collaborators'
  | null;

export interface ModalState {
  type: ModalType;
  taskId?: string;
  boardId?: string;
  columnId?: string;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  state = signal<ModalState>({ type: null });

  open(
    type: Exclude<ModalType, null>,
    options?: { taskId?: string; boardId?: string; columnId?: string },
  ): void {
    this.state.set({ type, ...(options ?? {}) });
  }

  close(): void {
    this.state.set({ type: null });
  }
}
