import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-checkbox',
  imports: [],
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.css',
})
export class Checkbox {
  checked = input<boolean>(false);
  checkedChange = output<boolean>();

  onChange(event: Event): void {
    const el = event.target as HTMLInputElement;
    this.checkedChange.emit(el.checked);
  }
}
