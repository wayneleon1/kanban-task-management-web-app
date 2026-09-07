import { Component, computed, inject, input } from '@angular/core';
import { Task } from '../../../../core/models/board.model';
import { ModalService } from '../../../../core/services/modal.service';
import { formatDueDate } from '../../../../core/utils/date.util';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [],
  templateUrl: './task-card.html',
  styleUrl: './task-card.css',
})
export class TaskCard {
  task = input.required<Task>();
  modalService = inject(ModalService);

  completedSubtasks = computed(() => this.task().subtasks.filter((s) => s.isCompleted).length);
  totalSubtasks = computed(() => this.task().subtasks.length);
  formattedDueDate = computed(() => {
    const dueDate = this.task().dueDate;
    return dueDate ? formatDueDate(dueDate) : '';
  });

  openTask(): void {
    this.modalService.open('view-task', { taskId: this.task().id });
  }
}
