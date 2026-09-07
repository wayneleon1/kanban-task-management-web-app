import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';

import { Modal } from '../../../../shared/components/modal/modal';
import { ModalService } from '../../../../core/services/modal.service';
import * as BoardActions from '../../store/board.actions';
import { selectActiveBoard } from '../../store/board.selectors';

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

  // Local model property — bound via [(ngModel)] in template
  boardNameModel = '';

  isEditMode = false;
  heading = '';
  submitLabel = '';
  nameLabel = '';

  private activeBoard = this.store.selectSignal(selectActiveBoard);

  ngOnInit(): void {
    this.isEditMode = this.modalService.state().type === 'edit-board';
    this.heading = this.isEditMode ? 'Edit Board' : 'Add New Board';
    this.submitLabel = this.isEditMode ? 'Save Changes' : 'Create New Board';
    this.nameLabel = this.isEditMode ? 'Board Name' : 'Name';

    if (this.isEditMode) {
      // Read signal value synchronously — no async required
      const board = this.activeBoard();
      if (board) {
        this.boardNameModel = board.name;
      }
    }
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    const name = this.boardNameModel.trim();

    if (this.isEditMode) {
      const boardId = this.modalService.state().boardId ?? '';
      this.store.dispatch(BoardActions.updateBoard({ boardId, name }));
    } else {
      // addBoard → Effect creates the board (with zero columns) → navigates
      this.store.dispatch(BoardActions.addBoard({ name }));
    }
    this.modalService.close();
  }

  onCancel(): void {
    this.modalService.close();
  }
}
