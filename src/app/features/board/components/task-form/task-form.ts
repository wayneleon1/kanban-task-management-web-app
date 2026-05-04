import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Modal } from '../../../../shared/components/modal/modal';
import { Input } from '../../../../shared/components/input/input';
import { Button } from '../../../../shared/components/button/button';
import { Dropdown } from '../../../../shared/components/dropdown/dropdown';
import { ModalService } from '../../../../core/services/modal.service';
import { BoardService } from '../../../../core/services/board.service';
import { Task } from '../../../../core/models/board.model';
import { generateId } from '../../../../core/utils/id.utils';

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
  private modalService = inject(ModalService);
  private boardService = inject(BoardService);

  // ── Form State ──
  title = signal('');
  titleError = signal('');
  description = signal('');
  subtasks = signal<SubtaskDraft[]>([]);
  status = signal('');

  isEditMode = computed(() => this.modalService.state().type === 'edit-task');
  heading = computed(() => (this.isEditMode() ? 'Edit Task' : 'Add New Task'));
  submitLabel = computed(() => (this.isEditMode() ? 'Save Changes' : 'Create Task'));

  statusOptions = computed(
    () =>
      this.boardService.activeBoard()?.columns.map((c) => ({ label: c.name, value: c.name })) ?? [],
  );

  ngOnInit(): void {
    if (this.isEditMode()) {
      this.loadExistingTask();
    } else {
      this.subtasks.set([
        { id: generateId(), title: '', error: '' },
        { id: generateId(), title: '', error: '' },
      ]);
      this.status.set(this.boardService.activeBoard()?.columns[0]?.name ?? '');
    }
  }

  private loadExistingTask(): void {
    const taskId = this.modalService.state().taskId ?? '';
    const result = this.boardService.findTask(taskId);
    if (!result) return;
    const { task } = result;
    this.title.set(task.title);
    this.description.set(task.description);
    this.status.set(task.status);
    this.subtasks.set(task.subtasks.map((s) => ({ id: s.id, title: s.title, error: '' })));
  }

  // ── Subtask Management ──
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

  // ── Validation ──
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

  // ── Submit ──
  onSubmit(): void {
    if (!this.validate()) return;

    if (this.isEditMode()) {
      const taskId = this.modalService.state().taskId ?? '';
      const result = this.boardService.findTask(taskId);
      if (!result) return;

      // Preserve isCompleted for existing subtasks
      const completedMap = new Map(result.task.subtasks.map((s) => [s.id, s.isCompleted]));

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

      this.boardService.updateTask(result.boardId, taskId, updates);
    } else {
      const taskData: Omit<Task, 'id'> = {
        title: this.title().trim(),
        description: this.description().trim(),
        status: this.status(),
        subtasks: this.subtasks()
          .filter((s) => s.title.trim())
          .map((s) => ({ id: s.id, title: s.title.trim(), isCompleted: false })),
      };
      this.boardService.addTask(this.boardService.activeBoardId(), taskData);
    }

    this.modalService.close();
  }
}
