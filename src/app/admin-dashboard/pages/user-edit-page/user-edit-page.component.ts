import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '@dashboard/users/services/user.service';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-user-edit-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-edit-page.component.html',
})
export class UserEditPageComponent implements OnInit {

  form!: FormGroup;
  loading = false;
  error = '';
  userId!: string;
  customerName = '';

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.userId = this.route.snapshot.paramMap.get('id')!;

    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      roles: ['', Validators.required],
      cust_code: [{ value: '', disabled: true }]
    });

    this.loadUser();
  }

  loadUser() {
    this.loading = true;

    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.loading = false;

        this.form.patchValue({
          fullName: user.fullName,
          email: user.email,
          roles: user.roles.join(','),
        });
        this.customerName = user.cust?.name ?? user.cust_code ?? 'Sin cliente';
      },
      error: () => {
        this.loading = false;
        this.error = 'Error cargando el usuario';
      }
    });
  }

  save() {
    if (this.form.invalid) return;

    const formValue = this.form.value;

    const updateData = {
      fullName: formValue.fullName,
      email: formValue.email,
      roles: formValue.roles.split(',').map((r: string) => r.trim()),
    };

    this.userService.updateUser(this.userId, updateData).subscribe({
      next: () => {
        alert('Usuario actualizado');
        this.router.navigate(['/admin/users']);
      },
      error: () => {
        this.error = 'Error actualizando el usuario';
      }
    });
  }
}
