import { Component, OnInit, inject, input, computed } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { generateId } from '../../../../core/utils/id.utils';
import { BoardMember } from '../../../../core/models/board.model';
import { hasAtLeast, resolveBoardPermission } from '../../../../core/utils/board-permission.util';
import {
  uniqueTitleValidator,
  futureDateValidator,
} from '../../../../core/validators/task.validators';
import { CanComponentDeactivate } from '../../../../core/guards/unsaved-changes.guard';
import * as BoardActions from '../../store/board.actions';
import { TaskDraft } from '../../store/board.actions';
import { selectBoardEntities } from '../../store/board.selectors';
import { selectCurrentUser } from '../../../auth/store/auth.selectors';

@Component({
  selector: 'app-task-form-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './task-form-page.html',
  styleUrl: './task-form-page.css',
})
export class TaskFormPage implements OnInit, CanComponentDeactivate {
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private router = inject(Router);

  id = input<string>('');
  taskId = input<string>('');

  isEditMode = computed(() => !!this.taskId());
  heading = computed(() => (this.isEditMode() ? 'Edit Task' : 'Add New Task'));
  submitLabel = computed(() => (this.isEditMode() ? 'Save Changes' : 'Create Task'));

  private allEntities = this.store.selectSignal(selectBoardEntities);

  board = computed(() => this.allEntities()[this.id()] ?? null);
  statusOptions = computed(() => this.board()?.columns.map((c) => c.name) ?? []);

  private authUser = this.store.selectSignal(selectCurrentUser);
  private canEditBoard = computed(() =>
    hasAtLeast(resolveBoardPermission(this.authUser(), this.board()), 'editor'),
  );

  // Assignee choices: the board's owner plus any collaborators
  boardMembers = computed<BoardMember[]>(() => {
    const board = this.board();
    if (!board) return [];
    const owner = board.owner ? [board.owner] : [];
    const collaborators = (board.collaborators ?? []).map((c) => c.user);
    return [...owner, ...collaborators];
  });

  private submitted = false;

  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)],
    dueDate: ['', futureDateValidator()],
    status: ['', Validators.required],
    assignee: [''],
    subtasks: this.fb.array([]),
  });

  get titleCtrl(): AbstractControl {
    return this.form.get('title')!;
  }
  get descCtrl(): AbstractControl {
    return this.form.get('description')!;
  }
  get dateCtrl(): AbstractControl {
    return this.form.get('dueDate')!;
  }
  get statusCtrl(): AbstractControl {
    return this.form.get('status')!;
  }
  get assigneeCtrl(): AbstractControl {
    return this.form.get('assignee')!;
  }
  get subtasksArr(): FormArray {
    return this.form.get('subtasks') as FormArray;
  }

  ngOnInit(): void {
    if (!this.canEditBoard()) {
      this.router.navigate(['/boards', this.id()]);
      return;
    }

    // uniqueTitleValidator receives a BoardLookupFn — reads from store signal
    this.titleCtrl.addValidators(
      uniqueTitleValidator(
        (id: string) => this.allEntities()[id] ?? null,
        this.id(),
        this.isEditMode() ? this.taskId() : undefined,
      ),
    );
    this.titleCtrl.updateValueAndValidity();

    if (this.isEditMode()) {
      this.loadExistingTask();
    } else {
      this.addSubtask();
      this.addSubtask();
      this.statusCtrl.setValue(this.statusOptions()[0] ?? '');
    }
  }

  // Synchronous task lookup — reads directly from the store signal
  private findTask(taskId: string) {
    for (const board of Object.values(this.allEntities())) {
      if (!board) continue;
      for (const col of board.columns) {
        const task = col.tasks.find((t) => t.id === taskId);
        if (task) return { task, boardId: board.id };
      }
    }
    return null;
  }

  private loadExistingTask(): void {
    const result = this.findTask(this.taskId());
    if (!result) {
      this.router.navigate(['/boards', this.id()]);
      return;
    }

    const { task } = result;
    this.form.patchValue({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate ?? '',
      status: task.status,
      assignee: task.assignedTo?.id ?? '',
    });

    this.subtasksArr.clear();
    task.subtasks.forEach((st) => this.addSubtask(st.title));
    this.form.markAsPristine();
  }

  addSubtask(value = ''): void {
    this.subtasksArr.push(this.fb.group({ title: [value, Validators.required] }));
  }

  removeSubtask(index: number): void {
    this.subtasksArr.removeAt(index);
    this.form.markAsDirty();
  }

  getSubtaskGroup(i: number): FormGroup {
    return this.subtasksArr.at(i) as FormGroup;
  }

  getTitleError(): string {
    const c = this.titleCtrl;
    if (c.hasError('required')) return 'Title is required.';
    if (c.hasError('minlength')) return 'Title must be at least 3 characters.';
    if (c.hasError('maxlength')) return 'Title cannot exceed 100 characters.';
    if (c.hasError('duplicateTitle')) return 'A task with this title already exists on this board.';
    return '';
  }

  getDateError(): string {
    return this.dateCtrl.hasError('pastDate') ? 'Due date cannot be in the past.' : '';
  }

  getSubtaskError(i: number): string {
    const ctrl = this.getSubtaskGroup(i).get('title');
    return ctrl?.hasError('required') && ctrl.touched ? "Can't be empty." : '';
  }

  canDeactivate(): boolean {
    return this.submitted || !this.form.dirty;
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { title, description, dueDate, status, assignee, subtasks } = this.form.value;
    const boardId = this.id();
    const assignedToId: string | null = assignee || null;

    if (this.isEditMode()) {
      const result = this.findTask(this.taskId());
      if (!result) return;

      const completedMap = new Map(result.task.subtasks.map((s) => [s.id, s.isCompleted]));
      const updatedSubtasks = (subtasks as { title: string }[]).map((s, i) => {
        const existingId = result.task.subtasks[i]?.id ?? generateId();
        return {
          id: existingId,
          title: s.title.trim(),
          isCompleted: completedMap.get(existingId) ?? false,
        };
      });

      this.store.dispatch(
        BoardActions.updateTask({
          boardId: result.boardId,
          taskId: this.taskId(),
          updates: {
            title: title.trim(),
            description: description.trim(),
            dueDate: dueDate || undefined,
            status,
            assignedToId,
            subtasks: updatedSubtasks,
          },
        }),
      );
    } else {
      const newTask: TaskDraft = {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || undefined,
        status,
        assignedToId,
        subtasks: (subtasks as { title: string }[]).map((s) => ({
          id: generateId(),
          title: s.title.trim(),
          isCompleted: false,
        })),
      };
      this.store.dispatch(BoardActions.addTask({ boardId, task: newTask }));
    }

    this.submitted = true;
    this.form.markAsPristine();
    this.router.navigate(['/boards', boardId]);
  }

  onCancel(): void {
    this.router.navigate(['/boards', this.id()]);
  }
}
