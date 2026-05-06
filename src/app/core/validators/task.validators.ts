import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { BoardService } from '../services/board.service';

// Prevents two tasks on the same board from having identical titles.
export function uniqueTitleValidator(
  boardService: BoardService,
  boardId: string,
  excludeTaskId?: string,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').trim().toLowerCase();

    // Let required handle empty
    if (!value) return null;

    const board = boardService.getBoardById(boardId);
    if (!board) return null;

    const isDuplicate = board.columns.some((col) =>
      col.tasks.some((t) => t.id !== excludeTaskId && t.title.trim().toLowerCase() === value),
    );

    return isDuplicate ? { duplicateTitle: true } : null;
  };
}

// Ensures the due date is not in the past
export function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null; // Optional field — empty is fine

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(control.value);

    return selected < today ? { pastDate: true } : null;
  };
}

//  Useful for descriptions — ensures at minimum N words are provided.
export function minWordCountValidator(minWords: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value?.trim()) return null;
    const wordCount = control.value.trim().split(/\s+/).length;
    return wordCount < minWords
      ? { minWordCount: { required: minWords, actual: wordCount } }
      : null;
  };
}
