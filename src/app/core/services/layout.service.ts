import { Injectable, signal, computed, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  // Sidebar (desktop only)
  sidebarVisible = signal<boolean>(true);

  // Mobile board-select menu
  mobileBoardMenuOpen = signal<boolean>(false);

  // Reactive mobile breakpoint detection
  isMobile = signal<boolean>(this.checkMobile());

  constructor() {
    // Listen for viewport changes
    const mq = window.matchMedia('(max-width: 768px)');
    mq.addEventListener('change', (e) => {
      this.isMobile.set(e.matches);
      // Always hide sidebar on mobile
      if (e.matches) this.sidebarVisible.set(false);
    });
    // Set initial state
    if (this.checkMobile()) this.sidebarVisible.set(false);
  }

  hideSidebar(): void {
    this.sidebarVisible.set(false);
  }
  showSidebar(): void {
    this.sidebarVisible.set(true);
  }

  toggleMobileBoardMenu(): void {
    this.mobileBoardMenuOpen.update((v) => !v);
  }

  closeMobileBoardMenu(): void {
    this.mobileBoardMenuOpen.set(false);
  }

  private checkMobile(): boolean {
    return window.matchMedia('(max-width: 768px)').matches;
  }
}
