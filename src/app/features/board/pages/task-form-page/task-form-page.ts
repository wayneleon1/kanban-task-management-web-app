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

import { BoardService } from '../../../../core/services/board.service';
import { generateId } from '../../../../core/utils/id.utils';
import { Task } from '../../../../core/models/board.model';
import {
  uniqueTitleValidator,
  futureDateValidator,
} from '../../../../core/validators/task.validators';
import { CanComponentDeactivate } from '../../../../core/guards/unsaved-changes.guard';

@Component({
  selector: 'app-task-form-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './task-form-page.html',
  styleUrl: './task-form-page.css',
})
export class TaskFormPage implements OnInit, CanComponentDeactivate {
  private fb = inject(FormBuilder);
  private boardService = inject(BoardService);
  private router = inject(Router);

  id = input<string>(''); // :id  (board id)
  taskId = input<string>(''); // :taskId (empty on new-task route)

  // ── Derived state ──
  isEditMode = computed(() => !!this.taskId());
  heading = computed(() => (this.isEditMode() ? 'Edit Task' : 'Add New Task'));
  submitLabel = computed(() => (this.isEditMode() ? 'Save Changes' : 'Create Task'));

  statusOptions = computed(
    () => this.boardService.getBoardById(this.id())?.columns.map((c) => c.name) ?? [],
  );

  // Prevent CanDeactivate from firing after successful submit
  private submitted = false;

  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    dueDate: ['', [futureDateValidator()]],
    status: ['', [Validators.required]],
    subtasks: this.fb.array([]),
  });

  // ── Typed control accessors (avoid repeated form.get() calls) ──
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
  get subtasksArr(): FormArray {
    return this.form.get('subtasks') as FormArray;
  }

  ngOnInit(): void {
    // Add unique title validator (needs runtime boardId + excludeTaskId)
    this.titleCtrl.addValidators(
      uniqueTitleValidator(
        this.boardService,
        this.id(),
        this.isEditMode() ? this.taskId() : undefined,
      ),
    );
    this.titleCtrl.updateValueAndValidity();

    if (this.isEditMode()) {
      this.loadExistingTask();
    } else {
      // Pre-populate: 2 empty subtask fields + first column as default status
      this.addSubtask();
      this.addSubtask();
      const defaultStatus = this.statusOptions()[0] ?? '';
      this.statusCtrl.setValue(defaultStatus);
    }
  }

  // ── Pre-populate form for edit mode using patchValue() ──
  private loadExistingTask(): void {
    const result = this.boardService.findTask(this.taskId());
    if (!result) {
      this.router.navigate(['/boards', this.id()]);
      return;
    }

    const { task } = result;

    // patchValue() sets only the fields it knows about
    this.form.patchValue({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate ?? '',
      status: task.status,
    });

    // Re-populate the FormArray with existing subtask titles
    this.subtasksArr.clear();
    task.subtasks.forEach((st) => this.addSubtask(st.title));

    // Mark pristine so CanDeactivate doesn't warn on page load
    this.form.markAsPristine();
  }

  /** Creates a single subtask FormGroup with its own validators */
  private createSubtaskGroup(value = ''): FormGroup {
    return this.fb.group({
      title: [value, [Validators.required]],
    });
  }

  addSubtask(value = ''): void {
    this.subtasksArr.push(this.createSubtaskGroup(value));
  }

  removeSubtask(index: number): void {
    this.subtasksArr.removeAt(index);
    this.form.markAsDirty();
  }

  getSubtaskGroup(index: number): FormGroup {
    return this.subtasksArr.at(index) as FormGroup;
  }

  //  ERROR MESSAGE HELPERS

  getTitleError(): string {
    const c = this.titleCtrl;
    if (c.hasError('required')) return 'Title is required.';
    if (c.hasError('minlength')) return `Title must be at least 3 characters.`;
    if (c.hasError('maxlength')) return 'Title cannot exceed 100 characters.';
    if (c.hasError('duplicateTitle')) return 'A task with this title already exists on this board.';
    return '';
  }

  getDescError(): string {
    if (this.descCtrl.hasError('maxlength')) return 'Description cannot exceed 500 characters.';
    return '';
  }

  getDateError(): string {
    if (this.dateCtrl.hasError('pastDate')) return 'Due date cannot be in the past.';
    return '';
  }

  getSubtaskError(index: number): string {
    const ctrl = this.getSubtaskGroup(index).get('title');
    if (ctrl?.hasError('required') && ctrl.touched) return "Can't be empty.";
    return '';
  }

  canDeactivate(): boolean {
    // Allow leaving if: already submitted OR form hasn't been touched
    return this.submitted || !this.form.dirty;
  }

  // FORM SUBMISSION
  onSubmit(): void {
    // Mark ALL controls as touched so every error becomes visible
    this.form.markAllAsTouched();

    // Stop if any control is invalid
    if (this.form.invalid) return;

    const { title, description, dueDate, status, subtasks } = this.form.value;
    const boardId = this.id();

    if (this.isEditMode()) {
      const result = this.boardService.findTask(this.taskId());
      if (!result) return;

      // Preserve isCompleted state for subtasks that already existed
      const completedMap = new Map(result.task.subtasks.map((s) => [s.id, s.isCompleted]));

      const updatedSubtasks = (subtasks as { title: string }[]).map((s, i) => {
        const existingId = result.task.subtasks[i]?.id ?? generateId();
        return {
          id: existingId,
          title: s.title.trim(),
          isCompleted: completedMap.get(existingId) ?? false,
        };
      });

      this.boardService.updateTask(result.boardId, this.taskId(), {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || undefined,
        status,
        subtasks: updatedSubtasks,
      });
    } else {
      const newTask: Omit<Task, 'id'> = {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || undefined,
        status,
        subtasks: (subtasks as { title: string }[]).map((s) => ({
          id: generateId(),
          title: s.title.trim(),
          isCompleted: false,
        })),
      };
      this.boardService.addTask(boardId, newTask);
    }

    this.submitted = true;
    this.form.markAsPristine();
    this.router.navigate(['/boards', boardId]);
  }

  onCancel(): void {
    this.router.navigate(['/boards', this.id()]);
  }
}
