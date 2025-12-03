import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '@dashboard/users/services/user.service';
import { CustService } from '@dashboard/cust/services/cust.service';

@Component({
  selector: 'app-user-create-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-create-page.component.html',
})
export class UserCreatePageComponent implements OnInit {
  
  form!: FormGroup;
  loading = false;
  error: string | null = null;
  customers: any[] = [];
  projects: any[] = [];
  roles: string[] = [];
  
  constructor(
    private fb: FormBuilder,
    private usersService: UserService,
    private router: Router,
    private custService: CustService,
    // private projService: ProjService,    
  ) {}
  
  ngOnInit(): void {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      roles: ['', Validators.required],
      cust_code: ['', Validators.required],
      proj_ids: [[]],
    });

    this.loadCustomers();
    // this.form.get('cust_code')?.valueChanges.subscribe(custCode => {
    //   if (!custCode) return;

    //   this.projService.getProjectsByCust(custCode).subscribe({
    //     next: (list) => {
    //       this.projects = list;
    //       this.form.patchValue({ proj_ids: [] }); // Limpiar selección
    //     },
    //     error: () => console.error('Error cargando proyectos'),
    //   });
    // });

  }

  loadCustomers() {
    this.custService.getCusts().subscribe({
      next: (custs) => this.customers = custs,
      error: () => console.error('Error cargando clientes'),
    });
  }

  
  create() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log('creando usuario');
    
    this.loading = true;

    const payload = {
      ...this.form.value,      
      roles: Array.isArray(this.form.value.roles)
        ? this.form.value.roles
        : [this.form.value.roles],
      proj_ids: this.form.value.proj_ids.map((x: string) => Number(x)),
    };

    this.usersService.createUser(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/admin/users']);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al crear usuario';
        this.loading = false;
      },
    });
  }

}
