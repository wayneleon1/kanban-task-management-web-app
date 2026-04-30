import { Component, input, output, signal } from '@angular/core';

export interface DropdownOption {
  label: string;
  value: string;
}
@Component({
  selector: 'app-dropdown',
  imports: [],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.css',
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class Dropdown {
  label = input<string>('');
  options = input<DropdownOption[]>([]);
  selected = input<string>('');

  selectedChange = output<string>();

  isOpen = signal(false);

  toggleDropdown(): void {
    this.isOpen.update((v) => !v);
  }

  selectOption(option: DropdownOption): void {
    this.selectedChange.emit(option.value);
    this.isOpen.set(false);
  }

  getSelectedLabel(): string {
    const found = this.options().find((o) => o.value === this.selected());
    return found ? found.label : (this.options()[0]?.label ?? '');
  }

  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('app-dropdown')) {
      this.isOpen.set(false);
    }
  }
}
