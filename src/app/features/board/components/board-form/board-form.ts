import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'; // ← Template-Driven Forms
import { Router } from '@angular/router';
import { Modal } from '../../../../shared/components/modal/modal';
import { ModalService } from '../../../../core/services/modal.service';
import { BoardService } from '../../../../core/services/board.service';
import { generateId } from '../../../../core/utils/id.utils';

interface ColumnModel {
  id: string;
  name: string;
}

@Component({
  selector: 'app-board-form',
  standalone: true,
  imports: [FormsModule, Modal],
  templateUrl: './board-form.html',
  styleUrl: './board-form.css',
})
export class BoardForm implements OnInit {
  private modalService = inject(ModalService);
  private boardService = inject(BoardService);
  private router = inject(Router);

  // NgModel binds directly to these via [(ngModel)]
  boardNameModel = '';

  // Regular array — ngModel mutates elements directly via reference
  columnsModel: ColumnModel[] = [];

  isEditMode = false;
  heading = '';
  submitLabel = '';
  nameLabel = '';
  colLabel = '';

  ngOnInit(): void {
    this.isEditMode = this.modalService.state().type === 'edit-board';
    this.heading = this.isEditMode ? 'Edit Board' : 'Add New Board';
    this.submitLabel = this.isEditMode ? 'Save Changes' : 'Create New Board';
    this.nameLabel = this.isEditMode ? 'Board Name' : 'Name';
    this.colLabel = this.isEditMode ? 'Board Columns' : 'Columns';

    if (this.isEditMode) {
      const board = this.boardService.activeBoard();
      if (board) {
        this.boardNameModel = board.name;
        // Map existing columns to the model array (ngModel will mutate these)
        this.columnsModel = board.columns.map((c) => ({ id: c.id, name: c.name }));
      }
    } else {
      this.columnsModel = [
        { id: generateId(), name: 'Todo' },
        { id: generateId(), name: 'Doing' },
      ];
    }
  }

  // ── Column management ──
  addColumn(): void {
    this.columnsModel.push({ id: generateId(), name: '' });
  }

  removeColumn(id: string): void {
    this.columnsModel = this.columnsModel.filter((c) => c.id !== id);
  }

  // ── Template-Driven submit: NgForm ref carries validity + controls ──
  onSubmit(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    const name = this.boardNameModel.trim();
    const colNames = this.columnsModel.map((c) => c.name.trim()).filter(Boolean);

    if (this.isEditMode) {
      this.boardService.updateBoard(this.boardService.activeBoardId(), name, colNames);
      this.modalService.close();
    } else {
      const newBoard = this.boardService.addBoard(name, colNames);
      this.modalService.close();
      this.router.navigate(['/boards', newBoard.id]);
    }
  }

  onCancel(): void {
    this.modalService.close();
  }
}
