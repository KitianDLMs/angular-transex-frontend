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


    // Cargar clientes
    this.loadCustomers();
  }


  // =========================================================
  // AGREGAR CLIENTE MÚLTIPLE
  // =========================================================

  addCustCode(): void {

    const control = this.form.get('custCodeInput');

    const code: string =
      control?.value?.trim()?.toUpperCase() || '';

    if (!code) {
      control?.markAsTouched();
      return;
    }


    // -------------------------------------------------------
    // Validación del input
    // -------------------------------------------------------

    if (control?.invalid) {

      control.markAsTouched();

      return;
    }


    // -------------------------------------------------------
    // Clientes actuales
    // -------------------------------------------------------

    const current: string[] =
      this.form.get('cust_codes')?.value || [];


    // -------------------------------------------------------
    // Evitar duplicados
    // -------------------------------------------------------

    if (current.includes(code)) {

      control?.setErrors({
        duplicate: true
      });

      this.custCodeInputName = null;

      return;
    }


    // -------------------------------------------------------
    // Buscar cliente
    // -------------------------------------------------------

    this.custService.getCustByCode(code).subscribe({

      next: (cust) => {

        // Cliente no existe
        if (!cust) {

          control?.setErrors({
            notFound: true
          });

          this.custCodeInputName = null;

          return;
        }


        // ---------------------------------------------------
        // Guardar nombre
        // ---------------------------------------------------

        this.custCodeNames[code] =
          cust.name;


        // ---------------------------------------------------
        // Agregar código
        // ---------------------------------------------------

        const updatedCodes = [
          ...current,
          code
        ];

        this.form
          .get('cust_codes')
          ?.setValue(updatedCodes);


        // ---------------------------------------------------
        // Limpiar input
        // ---------------------------------------------------

        control?.reset();

        this.custCodeInputName = null;


        // ---------------------------------------------------
        // Cargar proyectos
        // ---------------------------------------------------

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


  // =========================================================
  // VALIDAR CLIENTE MIENTRAS SE ESCRIBE / BLUR
  // =========================================================

  checkCustCodeMultiple(): void {

    const control =
      this.form.get('custCodeInput');

    const code: string =
      control?.value?.trim()?.toUpperCase() || '';


    // Limpiar nombre anterior

    this.custCodeInputName = null;


    // No hacer búsqueda si está vacío

    if (!code) {
      return;
    }


    // Si el formato es inválido

    if (control?.invalid) {
      return;
    }


    // Clientes actuales

    const current: string[] =
      this.form.get('cust_codes')?.value || [];


    // -------------------------------------------------------
    // Verificar duplicado
    // -------------------------------------------------------

    if (current.includes(code)) {

      control?.setErrors({
        duplicate: true
      });

      return;
    }


    // -------------------------------------------------------
    // Buscar cliente
    // -------------------------------------------------------

    this.custService.getCustByCode(code).subscribe({

      next: (customer) => {

        if (!customer) {

          this.custCodeInputName = null;

          control?.setErrors({
            notFound: true
          });

          return;
        }


        // Mostrar nombre debajo del input

        this.custCodeInputName =
          customer.name;


        // Cliente válido

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


  // =========================================================
  // CARGAR PROYECTOS DE UN CLIENTE
  // =========================================================

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


          // -------------------------------------------------
          // Evitar proyectos duplicados
          // -------------------------------------------------

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


          // Forzar actualización Angular

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


  // =========================================================
  // CLIENTE ÚNICO
  // =========================================================

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

            // Mostrar nombre

            this.customerName =
              cust.name;


            // Cliente válido

            control?.setErrors(null);


            // Limpiar proyectos anteriores

            this.projects = [];

            this.form
              .get('projects')
              ?.setValue([]);


            // Cargar proyectos

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


  // =========================================================
  // ELIMINAR CLIENTE MÚLTIPLE
  // =========================================================

  removeCustCode(
    code: string
  ): void {

    const current: string[] =
      this.form.get('cust_codes')?.value || [];


    // -------------------------------------------------------
    // Eliminar código
    // -------------------------------------------------------

    const filtered =
      current.filter(
        (c: string) =>
          c !== code
      );


    this.form
      .get('cust_codes')
      ?.setValue(filtered);


    // -------------------------------------------------------
    // Eliminar nombre
    // -------------------------------------------------------

    delete this.custCodeNames[code];


    // -------------------------------------------------------
    // Eliminar proyectos de ese cliente
    // -------------------------------------------------------

    this.projects =
      this.projects.filter(
        (project: any) =>
          project.custCode !== code
      );


    // -------------------------------------------------------
    // Mantener solamente proyectos válidos
    // -------------------------------------------------------

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


  // =========================================================
  // INPUT CLIENTE
  // =========================================================

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


    // Actualizar FormControl

    this.form
      .get('custCodeInput')
      ?.setValue(
        value,
        {
          emitEvent: false
        }
      );
  }


  // =========================================================
  // CARGAR CLIENTES
  // =========================================================

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


  // =========================================================
  // CREAR USUARIO
  // =========================================================

  create(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }


    const raw =
      this.form.getRawValue();


    const role =
      raw.roles;


    // -------------------------------------------------------
    // Payload base
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // USER → cliente único
    // -------------------------------------------------------

    if (
      role === 'user'
    ) {

      payload.cust_code =
        raw.cust_code;

    }


    // -------------------------------------------------------
    // ADMIN / SUPER-USER → múltiples clientes
    // -------------------------------------------------------

    if (
      role === 'admin' ||
      role === 'super-user'
    ) {

      payload.cust_codes =
        raw.cust_codes;

    }


    // -------------------------------------------------------
    // Crear usuario
    // -------------------------------------------------------

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


  // =========================================================
  // INPUT RUT
  // =========================================================

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