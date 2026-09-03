import { Component, OnInit } from '@angular/core';
import { ProjService } from '@shared/services/proj.service';

import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

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
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MatSelectModule,
    MatFormFieldModule
  ],
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

  // Cliente único
  customerName: string = '';

  // Input para agregar múltiples clientes
  custCodeInput: string = '';

  // Nombre del cliente que se está escribiendo
  custCodeInputName: string | null = null;

  // Relación:
  // código cliente -> nombre cliente
  custCodeNames: Record<string, string> = {};


  constructor(
    private fb: FormBuilder,
    private usersService: UserService,
    private router: Router,
    private custService: CustService,
    private projService: ProjService,
  ) {}


  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {

    this.form = this.fb.group({

      fullName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30)
        ]
      ],

      rut: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$|^\d{7,8}-[\dkK]$/
          )
        ]
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(50)
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(30),
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/
          )
        ]
      ],

      roles: [
        '',
        [
          Validators.required
        ]
      ],

      // Cliente único
      cust_code: [
        {
          value: '',
          disabled: true
        },
        [
          Validators.required,
          Validators.maxLength(13)
        ]
      ],

      // Múltiples clientes
      cust_codes: [
        {
          value: [],
          disabled: true
        }
      ],

      // Input temporal para agregar cliente
      custCodeInput: [
        '',
        [
          Validators.minLength(8),
          Validators.maxLength(13)
        ]
      ],

      // Proyectos
      projects: [[]]

    });


    // =========================================================
    // CAMBIO DE ROL
    // =========================================================

    this.form.get('roles')?.valueChanges.subscribe(role => {

      const one = this.form.get('cust_code');
      const many = this.form.get('cust_codes');
      const input = this.form.get('custCodeInput');

      // -------------------------------------------------------
      // USER
      // -------------------------------------------------------

      if (role === 'user') {

        // Cliente único
        one?.enable();

        // Deshabilitar múltiples
        many?.disable();
        many?.reset([]);

        input?.disable();
        input?.reset('');

        // Limpiar nombres
        this.custCodeInputName = null;
        this.custCodeNames = {};

        // Limpiar proyectos
        this.projects = [];

        this.form
          .get('projects')
          ?.setValue([]);

      }

      // -------------------------------------------------------
      // ADMIN / SUPER-USER
      // -------------------------------------------------------

      else if (
        role === 'admin' ||
        role === 'super-user'
      ) {

        // Múltiples clientes
        many?.enable();

        input?.enable();

        // Deshabilitar cliente único
        one?.disable();
        one?.reset('');

        // Limpiar cliente único
        this.customerName = '';

        // Limpiar proyectos
        this.projects = [];

        this.form
          .get('projects')
          ?.setValue([]);

        // Limpiar nombres
        this.custCodeInputName = null;
        this.custCodeNames = {};

      }

      // -------------------------------------------------------
      // SIN ROL
      // -------------------------------------------------------

      else {

        one?.disable();
        one?.reset('');

        many?.disable();
        many?.reset([]);

        input?.disable();
        input?.reset('');

        this.customerName = '';
        this.custCodeInputName = null;
        this.custCodeNames = {};

        this.projects = [];

        this.form
          .get('projects')
          ?.setValue([]);
      }

    });
    this.loadCustomers();
  }
  addCustCode(): void {
    const control = this.form.get('custCodeInput');
    const code: string =
      control?.value?.trim()?.toUpperCase() || '';

    if (!code) {
      control?.markAsTouched();
      return;
    }
    if (control?.invalid) {
      control.markAsTouched();
      return;
    }
    const current: string[] =
      this.form.get('cust_codes')?.value || [];

    if (current.includes(code)) {
      control?.setErrors({
        duplicate: true
      });
      this.custCodeInputName = null;
      return;
    }

    this.custService.getCustByCode(code).subscribe({
      next: (cust) => {
        if (!cust) {
          control?.setErrors({
            notFound: true
          });
          this.custCodeInputName = null;
          return;
        }
        this.custCodeNames[code] =
          cust.name;
        const updatedCodes = [
          ...current,
          code
        ];
        this.form
          .get('cust_codes')
          ?.setValue(updatedCodes);
        control?.reset();
        this.custCodeInputName = null;
        this.loadProjectsByCustomer(code);
      },
      error: (err) => {
        console.error(
          `Error buscando cliente ${code}:`,
          err
        );
        control?.setErrors({
          notFound: true
        });

        this.custCodeInputName = null;
      }
    });
  }

  checkCustCodeMultiple(): void {
    const control =
      this.form.get('custCodeInput');
    const code: string =
      control?.value?.trim()?.toUpperCase() || '';
    this.custCodeInputName = null;
    if (!code) {
      return;
    }
    if (control?.invalid) {
      return;
    }
    const current: string[] =
      this.form.get('cust_codes')?.value || [];
    if (current.includes(code)) {
      control?.setErrors({
        duplicate: true
      });
      return;
    }

    this.custService.getCustByCode(code).subscribe({
      next: (customer) => {
        if (!customer) {
          this.custCodeInputName = null;
          control?.setErrors({
            notFound: true
          });
          return;
        }
        this.custCodeInputName =
          customer.name;
        control?.setErrors(null);
      },
      error: (err) => {
        console.error(
          `Error buscando cliente ${code}:`,
          err
        );
        this.custCodeInputName = null;
        control?.setErrors({
          notFound: true
        });
      }
    });
  }

  loadProjectsByCustomer(
    custCode: string
  ): void {
    const code =
      custCode.trim().toUpperCase();
    this.projService
      .getByCust(code)
      .subscribe({
        next: (response: any) => {
          const projects =
            Array.isArray(response)
              ? response
              : response?.data ?? [];
          const newProjects =
            projects
              .map((p: any) => {
                const projectCode =
                  p.projcode ??
                  p.proj_code;
                const projectName =
                  (
                    p.projname ??
                    p.proj_name ??
                    ''
                  )
                    .split('|')
                    .pop()
                    ?.trim();
                return {
                  code: projectCode,
                  name:
                    projectName ||
                    projectCode,
                  custCode: code
                };
              })
              .filter(
                (p: any) => p.code
              );      
          const existingCodes =
            new Set(
              this.projects.map(
                p => p.code
              )
            );
          newProjects.forEach(
            (project: any) => {
              if (
                !existingCodes.has(
                  project.code
                )
              ) {
                this.projects.push(
                  project
                );
              }
            }
          );
          this.projects =
            [...this.projects];
        },
        error: (error) => {
          console.error(
            `❌ Error cargando proyectos del cliente ${code}:`,
            error
          );
        }
      });
  }

  checkCustCode(): void {
    const control =
      this.form.get('cust_code');
    const code =
      control?.value
        ?.trim()
        ?.toUpperCase();
    if (!code) {
      this.customerName = '';
      control?.setErrors({
        required: true
      });
      return;
    }
    this.custService
      .getCustByCode(code)
      .subscribe({
        next: (cust) => {
          if (cust) {
            this.customerName =
              cust.name;
            control?.setErrors(null);
            this.projects = [];
            this.form
              .get('projects')
              ?.setValue([]);
            this.loadProjectsByCustomer(
              code
            );
          }
          else {
            this.customerName =
              'Cliente no encontrado';
            control?.setErrors({
              notFound: true
            });
          }
        },
        error: (err) => {
          console.error(
            'Error buscando cliente:',
            err
          );
          this.customerName =
            'Error buscando cliente';
          control?.setErrors({
            notFound: true
          });
        }
      });
  }

  removeCustCode(
    code: string
  ): void {
    const current: string[] =
      this.form.get('cust_codes')?.value || [];
    const filtered =
      current.filter(
        (c: string) =>
          c !== code
      );
    this.form
      .get('cust_codes')
      ?.setValue(filtered);
    delete this.custCodeNames[code];
    this.projects =
      this.projects.filter(
        (project: any) =>
          project.custCode !== code
      );
    const selectedProjects: string[] =
      this.form.get('projects')?.value || [];

    const validProjectCodes =
      new Set(
        this.projects.map(
          project => project.code
        )
      );

    const filteredSelectedProjects =
      selectedProjects.filter(
        projectCode =>
          validProjectCodes.has(
            projectCode
          )
      );

    this.form
      .get('projects')
      ?.setValue(
        filteredSelectedProjects
      );
  }

  onCustCodeInput(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    let value =
      input.value
        .replace(
          /[^0-9kK-]/g,
          ''
        )
        .toUpperCase()
        .slice(0, 13);
    input.value =
      value;
    this.form
      .get('custCodeInput')
      ?.setValue(
        value,
        {
          emitEvent: false
        }
      );
  }

  loadCustomers(): void {
    this.custService
      .getCusts()
      .subscribe({
        next: (custs) => {
          this.customers =
            custs;
        },
        error: (err) => {
          console.error(
            'Error cargando clientes:',
            err
          );
        }
      });
  }

  create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw =
      this.form.getRawValue();
    const role =
      raw.roles;
    const payload: any = {
      fullName:
        raw.fullName,
      rut:
        raw.rut,
      email:
        raw.email,
      password:
        raw.password,
      roles:
        [role],
      projects:
        raw.projects
    };
    if (
      role === 'user'
    ) {
      payload.cust_code =
        raw.cust_code;
    }
    if (
      role === 'admin' ||
      role === 'super-user'
    ) {
      payload.cust_codes =
        raw.cust_codes;
    }

    this.loading = true;
    this.usersService
      .createUser(payload)
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate([
            '/admin/users'
          ]);
        },
        error: (err) => {
          this.loading = false;
          console.error(
            '❌ Error creando usuario:',
            err
          );
        }
      });
  }

  onRutInput(
    event: Event
  ): void {
    const input =
      event.target as HTMLInputElement;
    const value =
      input.value
        .replace(
          /[^0-9kK-]/g,
          ''
        )
        .toUpperCase()
        .slice(0, 10);
    input.value =
      value;
    this.form
      .get('rut')
      ?.setValue(
        value,
        {
          emitEvent: false
        }
      );
  }
}