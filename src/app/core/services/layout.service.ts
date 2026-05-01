import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  sidebarVisible = signal<boolean>(true);

  hideSidebar(): void {
    this.sidebarVisible.set(false);
  }
  showSidebar(): void {
    this.sidebarVisible.set(true);
  }
}
