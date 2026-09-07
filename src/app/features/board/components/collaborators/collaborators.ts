import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';

import { Modal } from '../../../../shared/components/modal/modal';
import { ModalService } from '../../../../core/services/modal.service';
import * as BoardActions from '../../store/board.actions';
import { selectBoardById } from '../../store/board.selectors';

@Component({
  selector: 'app-collaborators',
  standalone: true,
  imports: [FormsModule, Modal],
  templateUrl: './collaborators.html',
  styleUrl: './collaborators.css',
})
export class Collaborators {
  private store = inject(Store);
  private modalService = inject(ModalService);

  boardId = this.modalService.state().boardId ?? '';
  board = this.store.selectSignal(selectBoardById(this.boardId));

  inviteEmail = '';
  inviteRole: 'viewer' | 'editor' = 'viewer';

  onInvite(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    this.store.dispatch(
      BoardActions.addCollaborator({
        boardId: this.boardId,
        email: this.inviteEmail.trim(),
        role: this.inviteRole,
      }),
    );
    this.inviteEmail = '';
    form.resetForm({ role: this.inviteRole });
  }

  onRoleChange(userId: string, role: string): void {
    this.store.dispatch(
      BoardActions.updateCollaboratorRole({
        boardId: this.boardId,
        userId,
        role: role as 'viewer' | 'editor',
      }),
    );
  }

  onRemove(userId: string): void {
    this.store.dispatch(BoardActions.removeCollaborator({ boardId: this.boardId, userId }));
  }

  onClose(): void {
    this.modalService.close();
  }
}
