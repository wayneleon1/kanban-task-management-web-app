import { Component, computed, input } from '@angular/core';
import { Task } from '../../../../core/models/board.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [],
  templateUrl: './task-card.html',
  styleUrl: './task-card.css',
})
export class TaskCard {
  task = input.required<Task>();

  completedSubtasks = computed(() => this.task().subtasks.filter((s) => s.isCompleted).length);
  totalSubtasks = computed(() => this.task().subtasks.length);
}
