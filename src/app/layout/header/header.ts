import { Component, inject, signal, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { Button } from '../../shared/components/button/button';
import { LayoutService } from '../../core/services/layout.service';
import { ModalService } from '../../core/services/modal.service';
import { selectActiveBoard, selectActiveBoardId } from '../../features/board/store/board.selectors';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [Button],
  templateUrl: './header.html',
  styleUrl: './header.css',
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class Header {
  private store = inject(Store);
  private router = inject(Router);
  private el = inject(ElementRef);
  layoutService = inject(LayoutService);
  modalService = inject(ModalService);

  boardMenuOpen = signal(false);

  activeBoard = this.store.selectSignal(selectActiveBoard);
  activeBoardId = this.store.selectSignal(selectActiveBoardId);

  get hasColumns(): boolean {
    return (this.activeBoard()?.columns.length ?? 0) > 0;
  }

  openAddTask(): void {
    const boardId = this.activeBoardId();
    if (boardId) this.router.navigate(['/boards', boardId, 'new-task']);
  }

  openEditBoard(): void {
    this.boardMenuOpen.set(false);
    const boardId = this.activeBoardId();
    if (boardId) this.modalService.open('edit-board', { boardId });
  }

  openDeleteBoard(): void {
    this.boardMenuOpen.set(false);
    const boardId = this.activeBoardId();
    if (boardId) this.modalService.open('delete-board', { boardId });
  }

  onDocumentClick(event: Event): void {
    const menuEl = this.el.nativeElement.querySelector('.header__board-menu');
    if (menuEl && !menuEl.contains(event.target as Node)) {
      this.boardMenuOpen.set(false);
    }
  }
}
