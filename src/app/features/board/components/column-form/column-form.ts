import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';

import { Modal } from '../../../../shared/components/modal/modal';
import { ModalService } from '../../../../core/services/modal.service';
import * as BoardActions from '../../store/board.actions';
import { selectActiveBoard } from '../../store/board.selectors';

/** Handles both 'add-column' and 'rename-column' modal types — mirrors BoardForm's pattern. */
@Component({
  selector: 'app-column-form',
  standalone: true,
  imports: [FormsModule, Modal],
  templateUrl: './column-form.html',
  styleUrl: './column-form.css',
})
export class ColumnForm implements OnInit {
  private store = inject(Store);
  private modalService = inject(ModalService);

  nameModel = '';

  isRenameMode = false;
  heading = '';
  submitLabel = '';

  private activeBoard = this.store.selectSignal(selectActiveBoard);

  ngOnInit(): void {
    this.isRenameMode = this.modalService.state().type === 'rename-column';
    this.heading = this.isRenameMode ? 'Rename Column' : 'Add New Column';
    this.submitLabel = this.isRenameMode ? 'Save Changes' : 'Create Column';

    if (this.isRenameMode) {
      const columnId = this.modalService.state().columnId;
      const column = this.activeBoard()?.columns.find((c) => c.id === columnId);
      if (column) {
        this.nameModel = column.name;
      }
    }
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    const name = this.nameModel.trim();
    const boardId = this.modalService.state().boardId ?? '';

    if (this.isRenameMode) {
      const columnId = this.modalService.state().columnId ?? '';
      this.store.dispatch(BoardActions.renameColumn({ boardId, columnId, name }));
    } else {
      this.store.dispatch(BoardActions.addColumn({ boardId, name }));
    }
    this.modalService.close();
  }

  onCancel(): void {
    this.modalService.close();
  }
}
