import { Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { Button } from '../../../../shared/components/button/button';
import { ModalService } from '../../../../core/services/modal.service';
import { selectAllBoards, selectBoardsLoading } from '../../store/board.selectors';

/**
 * Landing page for the bare `/boards` route: redirects to the user's first
 * board once loaded, or offers to create one if they have none yet.
 */
@Component({
  selector: 'app-boards-home',
  standalone: true,
  imports: [Button],
  templateUrl: './boards-home.html',
  styleUrl: './boards-home.css',
})
export class BoardsHome {
  private router = inject(Router);
  private store = inject(Store);

  modalService = inject(ModalService);

  boards = this.store.selectSignal(selectAllBoards);
  loading = this.store.selectSignal(selectBoardsLoading);

  constructor() {
    effect(() => {
      const first = this.boards()[0];
      if (first) this.router.navigate(['/boards', first.id]);
    });
  }
}
