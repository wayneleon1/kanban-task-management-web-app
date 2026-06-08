import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { Modal } from '../../../../shared/components/modal/modal';
import { Input } from '../../../../shared/components/input/input';
import { Button } from '../../../../shared/components/button/button';
import { Dropdown } from '../../../../shared/components/dropdown/dropdown';
import { ModalService } from '../../../../core/services/modal.service';
import { Task } from '../../../../core/models/board.model';
import { generateId } from '../../../../core/utils/id.utils';
import * as BoardActions from '../../store/board.actions';
import { selectActiveBoard, selectTaskResult } from '../../store/board.selectors';

interface SubtaskDraft {
  id: string;
  title: string;
  error: string;
}

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [Modal, Input, Button, Dropdown],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css',
})
export class TaskForm implements OnInit {
  private store = inject(Store);
  private modalService = inject(ModalService);

  // ── Selectors ──────────────────────────────────────────────────────────────
  private activeBoard = this.store.selectSignal(selectActiveBoard);

  // ── Form State ─────────────────────────────────────────────────────────────
  title = signal('');
  titleError = signal('');
  description = signal('');
  subtasks = signal<SubtaskDraft[]>([]);
  status = signal('');

  // ── Derived UI ─────────────────────────────────────────────────────────────
  isEditMode = computed(() => this.modalService.state().type === 'edit-task');
  heading = computed(() => (this.isEditMode() ? 'Edit Task' : 'Add New Task'));
  submitLabel = computed(() => (this.isEditMode() ? 'Save Changes' : 'Create Task'));

  // Status dropdown options come from the active board's columns in the store
  statusOptions = computed(
    () => this.activeBoard()?.columns.map((c) => ({ label: c.name, value: c.name })) ?? [],
  );

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    if (this.isEditMode()) {
      this.loadExistingTask();
    } else {
      this.subtasks.set([
        { id: generateId(), title: '', error: '' },
        { id: generateId(), title: '', error: '' },
      ]);
      // Default status to the first column of the active board
      this.status.set(this.activeBoard()?.columns[0]?.name ?? '');
    }
  }

  private loadExistingTask(): void {
    const taskId = this.modalService.state().taskId ?? '';

    // Read the task directly from the store using the memoized selector
    let taskResult: { task: Task; boardId: string } | null = null;
    this.store
      .select(selectTaskResult(taskId))
      .subscribe((result) => (taskResult = result))
      .unsubscribe();

    if (!taskResult) return;
    const { task } = taskResult as { task: Task; boardId: string };

    this.title.set(task.title);
    this.description.set(task.description);
    this.status.set(task.status);
    this.subtasks.set(task.subtasks.map((s) => ({ id: s.id, title: s.title, error: '' })));
  }

  // ── Subtask Management ─────────────────────────────────────────────────────
  addSubtask(): void {
    this.subtasks.update((list) => [...list, { id: generateId(), title: '', error: '' }]);
  }

  removeSubtask(id: string): void {
    this.subtasks.update((list) => list.filter((s) => s.id !== id));
  }

  updateSubtask(id: string, value: string): void {
    this.subtasks.update((list) =>
      list.map((s) => (s.id === id ? { ...s, title: value, error: '' } : s)),
    );
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  private validate(): boolean {
    let valid = true;

    if (!this.title().trim()) {
      this.titleError.set("Can't be empty");
      valid = false;
    } else {
      this.titleError.set('');
    }

    this.subtasks.update((list) =>
      list.map((s) => ({ ...s, error: !s.title.trim() ? "Can't be empty" : '' })),
    );

    if (this.subtasks().some((s) => s.error)) valid = false;

    return valid;
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  onSubmit(): void {
    if (!this.validate()) return;

    const boardId = this.activeBoard()?.id ?? '';

    if (this.isEditMode()) {
      const taskId = this.modalService.state().taskId ?? '';

      // Read current task from store to preserve isCompleted on subtasks
      let taskResult: { task: Task; boardId: string } | null = null;
      this.store
        .select(selectTaskResult(taskId))
        .subscribe((result) => (taskResult = result))
        .unsubscribe();

      if (!taskResult) return;
      const { task, boardId: taskBoardId } = taskResult as { task: Task; boardId: string };
      const completedMap = new Map(task.subtasks.map((s) => [s.id, s.isCompleted]));

      const updates: Partial<Omit<Task, 'id'>> = {
        title: this.title().trim(),
        description: this.description().trim(),
        status: this.status(),
        subtasks: this.subtasks()
          .filter((s) => s.title.trim())
          .map((s) => ({
            id: s.id,
            title: s.title.trim(),
            isCompleted: completedMap.get(s.id) ?? false,
          })),
      };

      // Dispatch to NgRx — Effect will PUT to the API
      this.store.dispatch(BoardActions.updateTask({ boardId: taskBoardId, taskId, updates }));
    } else {
      const taskData: Omit<Task, 'id'> = {
        title: this.title().trim(),
        description: this.description().trim(),
        status: this.status(),
        subtasks: this.subtasks()
          .filter((s) => s.title.trim())
          .map((s) => ({ id: s.id, title: s.title.trim(), isCompleted: false })),
      };

      // Dispatch to NgRx — Effect will PUT to the API
      this.store.dispatch(BoardActions.addTask({ boardId, task: taskData }));
    }

    this.modalService.close();
  }
}
