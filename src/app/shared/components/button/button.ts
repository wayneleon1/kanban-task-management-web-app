import { Component, input, output } from '@angular/core';

export type ButtonVariant = 'primary-lg' | 'primary-sm' | 'secondary' | 'destructive';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  variant = input<ButtonVariant>('primary-lg');
  disabled = input<boolean>(false);
  type = input<'button' | 'submit' | 'reset'>('button');

  btnClick = output<void>();

  handleClick(): void {
    if (!this.disabled()) {
      this.btnClick.emit();
    }
  }
}
