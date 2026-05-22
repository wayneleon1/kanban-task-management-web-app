import { Component, inject, signal, computed, ElementRef } from '@angular/core';
import { Router } from '@angular/router'; // ← NEW
import { Modal } from '../../../../shared/components/modal/modal';
import { Checkbox } from '../../../../shared/components/checkbox/checkbox';
import { Dropdown } from '../../../../shared/components/dropdown/dropdown';
import { ModalService } from '../../../../core/services/modal.service';
import { BoardService } from '../../../../core/services/board.service';

@Component({
  selector: 'app-view-task',
  standalone: true,
  imports: [Modal, Checkbox, Dropdown],
  templateUrl: './view-task.html',
  styleUrl: './view-task.css',
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class ViewTask {
  private modalService = inject(ModalService);
  private boardService = inject(BoardService);
  private router = inject(Router); // ← NEW
  private el = inject(ElementRef);

  menuOpen = signal(false);

  taskData = computed(() => {
    const taskId = this.modalService.state().taskId;
    return taskId ? (this.boardService.findTask(taskId) ?? null) : null;
  });

  task = computed(() => this.taskData()?.task ?? null);

  completedCount = computed(() => this.task()?.subtasks.filter((s) => s.isCompleted).length ?? 0);

  statusOptions = computed(
    () =>
      this.boardService.activeBoard()?.columns.map((c) => ({ label: c.name, value: c.name })) ?? [],
  );

  toggleSubtask(subtaskId: string): void {
    const data = this.taskData();
    if (!data) return;
    this.boardService.toggleSubtask(data.boardId, data.task.id, subtaskId);
  }

  onStatusChange(newStatus: string): void {
    const data = this.taskData();
    if (!data) return;
    this.boardService.updateTask(data.boardId, data.task.id, { status: newStatus });
  }

  // ── Navigate to route-based edit form (closes modal first) ──
  openEditTask(): void {
    this.menuOpen.set(false);
    const taskId = this.modalService.state().taskId;
    const data = this.taskData();
    this.modalService.close();
    if (data && taskId) {
      this.router.navigate(['/boards', data.boardId, 'edit', taskId]);
    }
  }

  openDeleteTask(): void {
    this.menuOpen.set(false);
    this.modalService.open('delete-task', { taskId: this.modalService.state().taskId });
  }

  onDocumentClick(event: Event): void {
    const menuEl = this.el.nativeElement.querySelector('.view-task__menu');
    if (menuEl && !menuEl.contains(event.target as Node)) {
      this.menuOpen.set(false);
    }
  }
}
