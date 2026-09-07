import { Component, inject, input, computed, effect } from '@angular/core';
import { Store } from '@ngrx/store';

import { BoardColumn } from '../../components/board-column/board-column';
import { Button } from '../../../../shared/components/button/button';
import { ModalService } from '../../../../core/services/modal.service';
import { hasAtLeast, resolveBoardPermission } from '../../../../core/utils/board-permission.util';
import { reorderColumns, setActiveBoard } from '../../store/board.actions';
import {
  selectBoardEntities,
  selectBoardsLoading,
  selectBoardsError,
} from '../../store/board.selectors';
import { selectCurrentUser } from '../../../auth/store/auth.selectors';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [BoardColumn, Button],
  templateUrl: './board-detail.html',
  styleUrl: './board-detail.css',
})
export class BoardDetail {
  private store = inject(Store);
  modalService = inject(ModalService);

  id = input<string>('');

  private allEntities = this.store.selectSignal(selectBoardEntities);

  board = computed(() => this.allEntities()[this.id()] ?? null);
  loading = this.store.selectSignal(selectBoardsLoading);
  error = this.store.selectSignal(selectBoardsError);

  private authUser = this.store.selectSignal(selectCurrentUser);
  canEdit = computed(() =>
    hasAtLeast(resolveBoardPermission(this.authUser(), this.board()), 'editor'),
  );

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) this.store.dispatch(setActiveBoard({ boardId: id }));
    });
  }

  moveColumn(columnId: string, direction: 'left' | 'right'): void {
    const board = this.board();
    if (!board) return;

    const ids = board.columns.map((c) => c.id);
    const index = ids.indexOf(columnId);
    const swapWith = direction === 'left' ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= ids.length) return;

    [ids[index], ids[swapWith]] = [ids[swapWith], ids[index]];
    this.store.dispatch(reorderColumns({ boardId: board.id, columnIds: ids }));
  }
}
