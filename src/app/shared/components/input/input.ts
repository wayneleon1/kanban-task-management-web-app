import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-input',
  imports: [],
  templateUrl: './input.html',
  styleUrl: './input.css',
})
export class Input {
  label = input<string>('');
  type = input<string>('text');
  placeholder = input<string>('');
  value = input<string>('');
  error = input<string>('');
  multiline = input<boolean>(false);
  rows = input<number>(4);

  valueChange = output<string>();
  isFocused = false;

  onInput(event: Event): void {
    const el = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.valueChange.emit(el.value);
  }
}
