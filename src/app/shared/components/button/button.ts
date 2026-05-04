import { Component, input, output } from '@angular/core';

export type ButtonVariant = 'primary-lg' | 'primary-sm' | 'secondary' | 'destructive';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.css',
  host: {
    '[style.display]': '"contents"',
  },
})
export class Button {
  variant = input<ButtonVariant>('primary-lg');
  disabled = input<boolean>(false);
  type = input<'button' | 'submit' | 'reset'>('button');
  fullWidth = input<boolean>(false);

  btnClick = output<void>();

  buttonClass(): string {
    const classes = ['btn', `btn--${this.variant()}`];
    if (this.fullWidth()) classes.push('btn--full-width');
    return classes.join(' ');
  }

  handleClick(): void {
    if (!this.disabled()) this.btnClick.emit();
  }
}
