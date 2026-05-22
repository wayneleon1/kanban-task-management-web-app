import { Component, inject, input, computed, effect } from '@angular/core';
import { Store } from '@ngrx/store';

import { BoardColumn } from '../../components/board-column/board-column';
import { Button } from '../../../../shared/components/button/button';
import { ModalService } from '../../../../core/services/modal.service';
import { setActiveBoard } from '../../store/board.actions';
import {
  selectBoardEntities,
  selectBoardsLoading,
  selectBoardsError,
} from '../../store/board.selectors';

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

  constructor() {
    effect(() => {
      const id = this.id();
      if (id) this.store.dispatch(setActiveBoard({ boardId: id }));
    });
  }
}
