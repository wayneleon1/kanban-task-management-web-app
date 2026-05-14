import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Board } from '../models/board.model';

export type BoardLookupFn = (boardId: string) => Board | null | undefined;

// Unique Task Title
export function uniqueTitleValidator(
  getBoardById: BoardLookupFn,
  boardId: string,
  excludeTaskId?: string,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').trim().toLowerCase();

    // Let Validators.required handle empty — avoid double error
    if (!value) return null;

    // Call the lookup function directly instead of boardService.getBoardById()
    const board = getBoardById(boardId);
    if (!board) return null;

    const isDuplicate = board.columns.some((col) =>
      col.tasks.some((t) => t.id !== excludeTaskId && t.title.trim().toLowerCase() === value),
    );

    return isDuplicate ? { duplicateTitle: true } : null;
  };
}

/**
 * CUSTOM VALIDATOR — Future Date
 * Ensures the selected date is not in the past.
 */
export function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(control.value);
    return selected < today ? { pastDate: true } : null;
  };
}

/**
 * CUSTOM VALIDATOR — Minimum Word Count
 */
export function minWordCountValidator(minWords: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value?.trim()) return null;
    const wordCount = control.value.trim().split(/\s+/).length;
    return wordCount < minWords
      ? { minWordCount: { required: minWords, actual: wordCount } }
      : null;
  };
}
