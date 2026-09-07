import { Component, inject, signal, computed, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { Modal } from '../../../../shared/components/modal/modal';
import { Checkbox } from '../../../../shared/components/checkbox/checkbox';
import { Dropdown } from '../../../../shared/components/dropdown/dropdown';
import { ModalService } from '../../../../core/services/modal.service';
import { formatDueDate } from '../../../../core/utils/date.util';
import { hasAtLeast, resolveBoardPermission } from '../../../../core/utils/board-permission.util';
import * as BoardActions from '../../store/board.actions';
import { selectAllBoards } from '../../store/board.selectors';
import { selectCurrentUser } from '../../../auth/store/auth.selectors';

@Component({
  selector: 'app-view-task',
  standalone: true,
  imports: [Modal, Checkbox, Dropdown],
  templateUrl: './view-task.html',
  styleUrl: './view-task.css',
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class ViewTask {
  private store = inject(Store);
  private modalService = inject(ModalService);
  private router = inject(Router);
  private el = inject(ElementRef);

  menuOpen = signal(false);

  private allBoards = this.store.selectSignal(selectAllBoards);
  private authUser = this.store.selectSignal(selectCurrentUser);

  canEdit = computed(() => {
    const boardId = this.taskResult()?.boardId;
    const board = boardId ? (this.allBoards().find((b) => b.id === boardId) ?? null) : null;
    return hasAtLeast(resolveBoardPermission(this.authUser(), board), 'editor');
  });

  taskResult = computed(() => {
    const taskId = this.modalService.state().taskId;
    if (!taskId) return null;
    for (const board of this.allBoards()) {
      for (const col of board.columns) {
        const task = col.tasks.find((t) => t.id === taskId);
        if (task) return { task, boardId: board.id };
      }
    }
    return null;
  });

  task = computed(() => this.taskResult()?.task ?? null);
  completedCount = computed(() => this.task()?.subtasks.filter((s) => s.isCompleted).length ?? 0);
  formattedDueDate = computed(() => {
    const dueDate = this.task()?.dueDate;
    return dueDate ? formatDueDate(dueDate) : '';
  });

  // Status options come from the task's own board (not just the active board)
  statusOptions = computed(() => {
    const boardId = this.taskResult()?.boardId;
    if (!boardId) return [];
    const board = this.allBoards().find((b) => b.id === boardId);
    return board?.columns.map((c) => ({ label: c.name, value: c.name })) ?? [];
  });

  toggleSubtask(subtaskId: string): void {
    if (!this.canEdit()) return;
    const result = this.taskResult();
    if (!result) return;
    this.store.dispatch(
      BoardActions.toggleSubtask({
        boardId: result.boardId,
        taskId: result.task.id,
        subtaskId,
      }),
    );
  }

  onStatusChange(newStatus: string): void {
    if (!this.canEdit()) return;
    const result = this.taskResult();
    if (!result) return;
    this.store.dispatch(
      BoardActions.updateTask({
        boardId: result.boardId,
        taskId: result.task.id,
        updates: { status: newStatus },
      }),
    );
  }

  openEditTask(): void {
    this.menuOpen.set(false);
    if (!this.canEdit()) return;
    const result = this.taskResult();
    this.modalService.close();
    if (result) {
      this.router.navigate(['/boards', result.boardId, 'edit', result.task.id]);
    }
  }

  openDeleteTask(): void {
    this.menuOpen.set(false);
    if (!this.canEdit()) return;
    this.modalService.open('delete-task', { taskId: this.modalService.state().taskId });
  }

  onDocumentClick(event: Event): void {
    const menuEl = this.el.nativeElement.querySelector('.view-task__menu');
    if (menuEl && !menuEl.contains(event.target as Node)) {
      this.menuOpen.set(false);
    }
  }
}
