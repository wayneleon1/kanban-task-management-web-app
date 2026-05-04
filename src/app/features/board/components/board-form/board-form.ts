import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Modal } from '../../../../shared/components/modal/modal';
import { Input } from '../../../../shared/components/input/input';
import { Button } from '../../../../shared/components/button/button';
import { ModalService } from '../../../../core/services/modal.service';
import { BoardService } from '../../../../core/services/board.service';
import { generateId } from '../../../../core/utils/id.utils';

interface ColumnDraft {
  id: string;
  name: string;
  error: string;
}

@Component({
  selector: 'app-board-form',
  imports: [Modal, Input, Button],
  templateUrl: './board-form.html',
  styleUrl: './board-form.css',
})
export class BoardForm implements OnInit {
  private modalService = inject(ModalService);
  private boardService = inject(BoardService);
  private router = inject(Router);

  boardName = signal('');
  boardNameError = signal('');
  columns = signal<ColumnDraft[]>([]);

  isEditMode = computed(() => this.modalService.state().type === 'edit-board');
  heading = computed(() => (this.isEditMode() ? 'Edit Board' : 'Add New Board'));
  submitLabel = computed(() => (this.isEditMode() ? 'Save Changes' : 'Create New Board'));
  nameLabel = computed(() => (this.isEditMode() ? 'Board Name' : 'Name'));
  colLabel = computed(() => (this.isEditMode() ? 'Board Columns' : 'Columns'));

  ngOnInit(): void {
    if (this.isEditMode()) {
      const board = this.boardService.activeBoard();
      if (board) {
        this.boardName.set(board.name);
        this.columns.set(board.columns.map((c) => ({ id: c.id, name: c.name, error: '' })));
      }
    } else {
      this.columns.set([
        { id: generateId(), name: 'Todo', error: '' },
        { id: generateId(), name: 'Doing', error: '' },
      ]);
    }
  }

  // ── Column Management ──
  addColumn(): void {
    this.columns.update((list) => [...list, { id: generateId(), name: '', error: '' }]);
  }

  removeColumn(id: string): void {
    this.columns.update((list) => list.filter((c) => c.id !== id));
  }

  updateColumn(id: string, value: string): void {
    this.columns.update((list) =>
      list.map((c) => (c.id === id ? { ...c, name: value, error: '' } : c)),
    );
  }

  // ── Validation ──
  private validate(): boolean {
    let valid = true;

    if (!this.boardName().trim()) {
      this.boardNameError.set("Can't be empty");
      valid = false;
    } else {
      this.boardNameError.set('');
    }

    this.columns.update((list) =>
      list.map((c) => ({ ...c, error: !c.name.trim() ? "Can't be empty" : '' })),
    );

    if (this.columns().some((c) => c.error)) valid = false;

    return valid;
  }

  // ── Submit ──
  onSubmit(): void {
    if (!this.validate()) return;

    const name = this.boardName().trim();
    const colNames = this.columns()
      .map((c) => c.name.trim())
      .filter(Boolean);

    if (this.isEditMode()) {
      this.boardService.updateBoard(this.boardService.activeBoardId(), name, colNames);
      this.modalService.close();
    } else {
      const newBoard = this.boardService.addBoard(name, colNames);
      this.modalService.close();
      this.router.navigate(['/boards', newBoard.id]);
    }
  }
}
