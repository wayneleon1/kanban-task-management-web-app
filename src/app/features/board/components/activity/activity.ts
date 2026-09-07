import { Component, OnInit, inject, signal } from '@angular/core';

import { Modal } from '../../../../shared/components/modal/modal';
import { ApiService } from '../../../../core/services/api.service';
import { ModalService } from '../../../../core/services/modal.service';
import { ActivityEntry } from '../../../../core/models/activity.model';
import { formatDateTime } from '../../../../core/utils/date.util';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [Modal],
  templateUrl: './activity.html',
  styleUrl: './activity.css',
})
export class Activity implements OnInit {
  private api = inject(ApiService);
  private modalService = inject(ModalService);

  boardId = this.modalService.state().boardId ?? '';

  entries = signal<ActivityEntry[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.api.getActivity(this.boardId).subscribe({
      next: (entries) => {
        this.entries.set(entries);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  formatTimestamp(iso: string): string {
    return formatDateTime(iso);
  }

  onClose(): void {
    this.modalService.close();
  }
}
