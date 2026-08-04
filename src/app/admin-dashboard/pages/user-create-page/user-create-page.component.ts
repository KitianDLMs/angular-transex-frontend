import { Component, OnInit } from '@angular/core';
import { ProjService } from "@shared/services/proj.service";
import { MatSelectModule } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
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
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './user-create-page.component.html',
  styleUrl: './user-create-page.component.css',
})
export class UserCreatePageComponent implements OnInit {

  form!: FormGroup;
  loading = false;
  error: string | null = null;
  customers: any[] = [];
  projects: any[] = [];
  roles: string[] = [];
  custCodeInput: string = '';
  customerName: string = '';

  constructor(
    private fb: FormBuilder,
    private usersService: UserService,
    private router: Router,
    private custService: CustService,        
    private projService: ProjService,        
  ) {}

  ngOnInit(): void {

    this.form = this.fb.group({
      fullName: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30)
      ]],
      rut: ['', [
        Validators.required,
        Validators.pattern(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$|^\d{7,8}-[\dkK]$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(50)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(30),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      ]],
      roles: ['', [Validators.required]],
      cust_code: [{ value: '', disabled: true }, [
        Validators.required,
        Validators.maxLength(13)
      ]],
      cust_codes: [{ value: [], disabled: true }],
      custCodeInput: ['', [
        Validators.minLength(8),
        Validators.maxLength(12)
      ]],
      projects: [[]]
    });

    this.form.get('roles')?.valueChanges.subscribe(role => {
      const one = this.form.get('cust_code');
      const many = this.form.get('cust_codes');

      if (role === 'user') {
        one?.enable();
        many?.disable();
        many?.reset();
      }

      else if (role === 'super-user') {
        many?.enable();
        one?.disable();
        one?.reset();
      }

      else {
        one?.disable(); one?.reset();
        many?.disable(); many?.reset();
      }
    });

    this.loadCustomers();
  }

  addCustCode() {
    const control = this.form.get('custCodeInput');
    const code: string = control?.value?.trim();

    if (!code) return;

    if (code.length < 9) {
      control?.setErrors({ minlength: true });
      return;
    }

    const current = this.form.get('cust_codes')?.value || [];

    if (current.includes(code)) {
      return;
    }

    // Agregar cliente
    const updatedCodes = [...current, code];

    this.form
      .get('cust_codes')
      ?.setValue(updatedCodes);

    control?.reset();

    // 🔥 NUEVO: cargar proyectos de ese cliente
    this.loadProjectsByCustomer(code);
  }

  loadProjectsByCustomer(custCode: string) {
    const code = custCode.trim();    
    this.projService.getByCust(code).subscribe({
      next: (response: any) => {     
        const projects = Array.isArray(response)
          ? response
          : response?.data ?? [];
        const newProjects = projects
          .map((p: any) => {
            const projectCode =
              p.projcode ??
              p.proj_code;
            const projectName = (
              p.projname ??
              p.proj_name ??
              ''
            )
              .split('|')
              .pop()
              ?.trim();
            return {
              code: projectCode,
              name: projectName || projectCode,
              custCode: code
            };
          })
          .filter((p: any) => p.code);
        // Evitar proyectos duplicados
        const existingCodes = new Set(
          this.projects.map(p => p.code)
        );
        newProjects.forEach((project: any) => {
          if (!existingCodes.has(project.code)) {
            this.projects.push(project);
          }
        });
        // 🔥 Importante para que Angular actualice el select
        this.projects = [...this.projects];
      },
      error: error => {
        console.error(
          `❌ Error cargando proyectos del cliente ${code}:`,
          error
        );
      }
    });
  }

  checkCustCode() {
    const control = this.form.get('cust_code');
    const code = control?.value?.trim();

    if (!code) {
      this.customerName = '';
      control?.setErrors({ required: true });
      return;
    }
    this.custService.getCustByCode(code).subscribe({
      next: (cust) => {
        if (cust) {
          this.customerName = cust.name;          
          control?.setErrors(null);
        } else {
          this.customerName = 'Cliente no encontrado';          
          control?.setErrors({ notFound: true });
        }
      },
      error: () => {
        this.customerName = 'Error buscando cliente';
        control?.setErrors({ notFound: true });
      }
    });
  }

  removeCustCode(code: string) {
    const current = this.form.get('cust_codes')?.value || [];
    const filtered = current.filter(
      (c: string) => c !== code
    );

    this.form.get('cust_codes')?.setValue(filtered);

    this.projects = this.projects.filter(
      (project: any) => project.custCode !== code
    );

    const selectedProjects =
      this.form.get('projects')?.value || [];

    const validProjectCodes = new Set(
      this.projects.map(
        (project: any) => project.code
      )
    );

    const filteredSelectedProjects =
      selectedProjects.filter(
        (projectCode: string) =>
          validProjectCodes.has(projectCode)
      );

    this.form
      .get('projects')
      ?.setValue(filteredSelectedProjects);
  }

  onCustCodeInput(event: any) {
    const input = event.target;
    input.value = input.value
      .replace(/[^0-9kK-]/g, '')
      .toUpperCase()
      .slice(0, 13);
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
    const role = this.form.value.roles;
    const raw = this.form.getRawValue();

    let payload: any = {
      fullName: raw.fullName,
      rut: raw.rut,
      email: raw.email,
      password: raw.password,
      roles: [role],
      projects: raw.projects
    };

    if (role === 'user') {
      payload.cust_code = raw.cust_code;
    }

    if (role === 'super-user') {
      payload.cust_codes = raw.cust_codes;
    }

    this.usersService.createUser(payload).subscribe({
      next: () => this.router.navigate(['/admin/users']),
      error: err => console.error(err),
    });
  }

  onRutInput(event: any) {
    const input = event.target;
    input.value = input.value
      .replace(/[^0-9kK-]/g, '')
      .toUpperCase()
      .slice(0, 10);
  }  
}
