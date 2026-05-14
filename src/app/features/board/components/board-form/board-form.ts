import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';

import { Modal } from '../../../../shared/components/modal/modal';
import { ModalService } from '../../../../core/services/modal.service';
import { generateId } from '../../../../core/utils/id.utils';
import * as BoardActions from '../../store/board.actions';
import { selectActiveBoard } from '../../store/board.selectors';

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
  private store = inject(Store);
  private modalService = inject(ModalService);

  // Local model properties — bound via [(ngModel)] in template
  boardNameModel = '';
  columnsModel: ColumnModel[] = [];

  isEditMode = false;
  heading = '';
  submitLabel = '';
  nameLabel = '';
  colLabel = '';

  private activeBoard = this.store.selectSignal(selectActiveBoard);

  ngOnInit(): void {
    this.isEditMode = this.modalService.state().type === 'edit-board';
    this.heading = this.isEditMode ? 'Edit Board' : 'Add New Board';
    this.submitLabel = this.isEditMode ? 'Save Changes' : 'Create New Board';
    this.nameLabel = this.isEditMode ? 'Board Name' : 'Name';
    this.colLabel = this.isEditMode ? 'Board Columns' : 'Columns';

    if (this.isEditMode) {
      // Read signal value synchronously — no async required
      const board = this.activeBoard();
      if (board) {
        this.boardNameModel = board.name;
        this.columnsModel = board.columns.map((c) => ({ id: c.id, name: c.name }));
      }
    } else {
      this.columnsModel = [
        { id: generateId(), name: 'Todo' },
        { id: generateId(), name: 'Doing' },
      ];
    }
  }

  addColumn(): void {
    this.columnsModel.push({ id: generateId(), name: '' });
  }

  removeColumn(id: string): void {
    this.columnsModel = this.columnsModel.filter((c) => c.id !== id);
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    const name = this.boardNameModel.trim();
    const colNames = this.columnsModel.map((c) => c.name.trim()).filter(Boolean);

    if (this.isEditMode) {
      const boardId = this.modalService.state().boardId ?? '';
      this.store.dispatch(BoardActions.updateBoard({ boardId, name, columnNames: colNames }));
    } else {
      // addBoard → Effect builds the entity → addBoardSuccess → navigates
      this.store.dispatch(BoardActions.addBoard({ name, columnNames: colNames }));
    }
    this.modalService.close();
  }

  onCancel(): void {
    this.modalService.close();
  }
}
