import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from '../button/button';
import { ModalService } from '../../../core/services/modal.service';
import { BoardService } from '../../../core/services/board.service';
import { Modal } from '../modal/modal';

@Component({
  selector: 'app-confirm-delete',
  standalone: true,
  imports: [Modal, Button],
  templateUrl: './confirm-delete.html',
  styleUrl: './confirm-delete.css',
})
export class ConfirmDelete {
  private modalService = inject(ModalService);
  private boardService = inject(BoardService);
  private router = inject(Router);

  isTask = computed(() => this.modalService.state().type === 'delete-task');

  title = computed(() => (this.isTask() ? 'Delete this task?' : 'Delete this board?'));

  message = computed(() => {
    if (this.isTask()) {
      const result = this.boardService.findTask(this.modalService.state().taskId ?? '');
      return `Are you sure you want to delete the '${result?.task.title ?? ''}' task and its subtasks? This action cannot be reversed.`;
    }
    const board = this.boardService.getBoardById(this.modalService.state().boardId ?? '');
    return `Are you sure you want to delete the '${board?.name ?? ''}' board? This action will remove all columns and tasks and cannot be reversed.`;
  });

  onDelete(): void {
    if (this.isTask()) {
      const taskId = this.modalService.state().taskId ?? '';
      const result = this.boardService.findTask(taskId);
      if (result) this.boardService.deleteTask(result.boardId, taskId);
      this.modalService.close();
    } else {
      const boardId = this.modalService.state().boardId ?? '';
      this.boardService.deleteBoard(boardId);
      this.modalService.close();
      const first = this.boardService.boards()[0];
      this.router.navigate(first ? ['/boards', first.id] : ['/']);
    }
  }

  onCancel(): void {
    this.modalService.close();
  }
}
