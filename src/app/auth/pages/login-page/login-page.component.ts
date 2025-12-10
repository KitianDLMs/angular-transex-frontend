import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  currentYear = new Date().getFullYear();

  hasError = signal(false);
  isPosting = signal(false);
  loading = signal(false);
  fb = inject(FormBuilder);
  router = inject(Router);

  authService = inject(AuthService);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    this.loading.set(true);

    if (this.loginForm.invalid) {
      this.hasError.set(true);

      setTimeout(() => {
        this.hasError.set(false);
        this.loading.set(false);  // 🔹 desactiva loading si el form está malo
      }, 2000);

      return;
    }

    const { email = '', password = '' } = this.loginForm.value;

    this.authService.login(email!, password!).subscribe((isAuthenticated) => {
      this.loading.set(false);   // 🔹 detén loading cuando la API responde

      if (isAuthenticated) {
        this.router.navigateByUrl('/store-front');
        return;
      }

      this.hasError.set(true);
      setTimeout(() => {
        this.hasError.set(false);
      }, 2000);
    });
  }

  // Check Authentication

  // Registro

  // Logout
}
