import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import * as AuthActions from '../../store/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../store/auth.selectors';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: '../../auth-shared.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private store = inject(Store);

  loading = this.store.selectSignal(selectAuthLoading);
  apiError = this.store.selectSignal(selectAuthError);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  get emailCtrl(): AbstractControl {
    return this.form.get('email')!;
  }
  get passwordCtrl(): AbstractControl {
    return this.form.get('password')!;
  }

  getEmailError(): string {
    if (this.emailCtrl.hasError('required')) return 'Email is required.';
    if (this.emailCtrl.hasError('email')) return 'Enter a valid email address.';
    return '';
  }

  getPasswordError(): string {
    return this.passwordCtrl.hasError('required') ? 'Password is required.' : '';
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { email, password } = this.form.getRawValue();
    this.store.dispatch(AuthActions.login({ request: { email: email!, password: password! } }));
  }
}
