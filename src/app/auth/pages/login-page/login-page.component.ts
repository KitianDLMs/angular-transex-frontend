import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RutFormatDirective } from '@auth/pipes/rut-format.directive';

import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, CommonModule, RutFormatDirective],
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
    rut: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    this.loading.set(true);
    console.log(this.loginForm.value);    
    if (this.loginForm.invalid) {
      this.hasError.set(true);

      setTimeout(() => {
        this.hasError.set(false);
        this.loading.set(false);
      }, 2000);

      return;
    }

    const { rut = '', password = '' } = this.loginForm.value;
    const cleanRut = rut!
      .replace(/[^0-9kK]/g, '')
      .toLowerCase();

    console.log('RUT limpio:', cleanRut);  
    this.authService.login(cleanRut, password!).subscribe((isAuthenticated) => {
      this.loading.set(false); 

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
}
