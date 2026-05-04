import { Component, inject } from '@angular/core';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    <div class="modal-backdrop" (click)="onBackdropClick()">
      <!-- stopPropagation prevents backdrop close when clicking the card -->
      <div class="modal-card" (click)="$event.stopPropagation()">
        <ng-content />
      </div>
    </div>
  `,
  styleUrl: './modal.css',
})
export class Modal {
  private modalService = inject(ModalService);

  onBackdropClick(): void {
    this.modalService.close();
  }
}
