import { Component, inject, computed } from '@angular/core';
import { Store } from '@ngrx/store';

import { Modal } from '../modal/modal';
import { Button } from '../button/button';
import { ModalService } from '../../../core/services/modal.service';
import * as BoardActions from '../../../features/board/store/board.actions';
import {
  selectAllBoards,
  selectBoardEntities,
} from '../../../features/board/store/board.selectors';

@Component({
  selector: 'app-confirm-delete',
  standalone: true,
  imports: [Modal, Button],
  templateUrl: './confirm-delete.html',
  styleUrl: './confirm-delete.css',
})
export class ConfirmDelete {
  private store = inject(Store);
  private modalService = inject(ModalService);

  // ✅ Two selectSignal() calls — both update synchronously with store changes
  private allBoards = this.store.selectSignal(selectAllBoards);
  private allEntities = this.store.selectSignal(selectBoardEntities);

  isTask = computed(() => this.modalService.state().type === 'delete-task');
  isColumn = computed(() => this.modalService.state().type === 'delete-column');

  title = computed(() => {
    if (this.isTask()) return 'Delete this task?';
    if (this.isColumn()) return 'Delete this column?';
    return 'Delete this board?';
  });

  /*
   * message() reads from both store signals AND modal state signal.
   * It recomputes whenever any of them change — fully reactive.
   */
  message = computed(() => {
    if (this.isTask()) {
      const taskId = this.modalService.state().taskId ?? '';
      let taskName = '';
      outer: for (const board of this.allBoards()) {
        for (const col of board.columns) {
          const task = col.tasks.find((t) => t.id === taskId);
          if (task) {
            taskName = task.title;
            break outer;
          }
        }
      }
      return `Are you sure you want to delete the '${taskName}' task and its subtasks? This action cannot be reversed.`;
    }

    if (this.isColumn()) {
      const { boardId, columnId } = this.modalService.state();
      const column = this.allEntities()[boardId ?? '']?.columns.find((c) => c.id === columnId);
      return `Are you sure you want to delete the '${column?.name ?? ''}' column and its tasks? This action cannot be reversed.`;
    }

    const boardId = this.modalService.state().boardId ?? '';
    const board = this.allEntities()[boardId];
    return `Are you sure you want to delete the '${board?.name ?? ''}' board? This action will remove all columns and tasks and cannot be reversed.`;
  });

  onDelete(): void {
    if (this.isTask()) {
      const taskId = this.modalService.state().taskId ?? '';
      let boardId = '';
      outer: for (const board of this.allBoards()) {
        for (const col of board.columns) {
          if (col.tasks.some((t) => t.id === taskId)) {
            boardId = board.id;
            break outer;
          }
        }
      }
      if (boardId) {
        this.store.dispatch(BoardActions.deleteTask({ boardId, taskId }));
      }
    } else if (this.isColumn()) {
      const boardId = this.modalService.state().boardId ?? '';
      const columnId = this.modalService.state().columnId ?? '';
      this.store.dispatch(BoardActions.deleteColumn({ boardId, columnId }));
    } else {
      const boardId = this.modalService.state().boardId ?? '';
      // deleteBoard → Effect handles navigation to the next board
      this.store.dispatch(BoardActions.deleteBoard({ boardId }));
    }
    this.modalService.close();
  }

  onCancel(): void {
    this.modalService.close();
  }
}
