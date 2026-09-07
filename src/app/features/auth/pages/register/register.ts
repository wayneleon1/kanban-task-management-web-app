import { Component, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';

import * as AuthActions from '../../store/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../store/auth.selectors';

function passwordsMatchValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password && confirmPassword && password !== confirmPassword
      ? { passwordMismatch: true }
      : null;
  };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: '../../auth-shared.css',
})
export class Register {
  private fb = inject(FormBuilder);
  private store = inject(Store);

  loading = this.store.selectSignal(selectAuthLoading);
  apiError = this.store.selectSignal(selectAuthError);

  form = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      role: ['editor' as 'editor' | 'viewer', [Validators.required]],
    },
    { validators: passwordsMatchValidator() },
  );

  get nameCtrl(): AbstractControl {
    return this.form.get('name')!;
  }
  get emailCtrl(): AbstractControl {
    return this.form.get('email')!;
  }
  get passwordCtrl(): AbstractControl {
    return this.form.get('password')!;
  }
  get confirmPasswordCtrl(): AbstractControl {
    return this.form.get('confirmPassword')!;
  }

  getNameError(): string {
    if (this.nameCtrl.hasError('required')) return 'Name is required.';
    if (this.nameCtrl.hasError('minlength')) return 'Name must be at least 2 characters.';
    return '';
  }

  getEmailError(): string {
    if (this.emailCtrl.hasError('required')) return 'Email is required.';
    if (this.emailCtrl.hasError('email')) return 'Enter a valid email address.';
    return '';
  }

  getPasswordError(): string {
    if (this.passwordCtrl.hasError('required')) return 'Password is required.';
    if (this.passwordCtrl.hasError('minlength')) return 'Password must be at least 8 characters.';
    return '';
  }

  getConfirmPasswordError(): string {
    if (this.confirmPasswordCtrl.hasError('required')) return 'Please confirm your password.';
    if (this.form.hasError('passwordMismatch') && this.confirmPasswordCtrl.touched) {
      return 'Passwords do not match.';
    }
    return '';
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { name, email, password, role } = this.form.getRawValue();
    this.store.dispatch(
      AuthActions.register({
        request: { name: name!.trim(), email: email!, password: password!, role: role! },
      }),
    );
  }
}
