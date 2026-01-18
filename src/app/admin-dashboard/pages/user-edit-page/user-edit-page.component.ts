import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { UserService } from '@dashboard/users/services/user.service';
import { ProjService } from '@shared/services/proj.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-user-edit-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    NgMultiSelectDropDownModule
  ],
  templateUrl: './user-edit-page.component.html',
  encapsulation: ViewEncapsulation.None
})
export class UserEditPageComponent implements OnInit {

  form!: FormGroup;
  loading = false;
  error = '';
  userId!: string;
  customerName = '';
  projects: any[] = [];
  dropdownSettings: any;
  
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private userService: UserService,
    private projService: ProjService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    
    // 🔹 Configuración correcta del dropdown
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'projcode',
      textField: 'projname',
      selectAllText: 'Seleccionar todos',
      unSelectAllText: 'Deseleccionar todos',
      itemsShowLimit: 30,
      allowSearchFilter: true,
      enableCheckAll: true,
      badgeShowLimit: 6
    };
    
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{1,15}$/;
    // 🔹 Formulario
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      roles: ['', Validators.required],
      cust_code: [{ value: '', disabled: true }],
      projects: [[]],
      password: [
        '',
        [
          Validators.maxLength(15),
          Validators.pattern(passwordRegex)
        ]
      ]
    });

    this.userId = this.route.snapshot.paramMap.get('id')!;
    this.loadUser();
  }

  loadUser(): void {
    this.loading = true;

    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.loading = false;

        this.form.patchValue({
          fullName: user.fullName,
          email: user.email,
          roles: Array.isArray(user.roles) ? user.roles.join(',') : user.roles,
          cust_code: user.cust_code
        });

        this.customerName = user.cust?.name ?? user.cust_code ?? 'Sin cliente';

        const userProjectCodes: string[] = Array.isArray(user.projects)
          ? user.projects.map((p: any) =>
              typeof p === 'string' ? p : p.proj_code
            )
          : [];

        if (!user.cust_code) return;

        this.projService.getByCust(user.cust_code).subscribe({
          next: (projects: any[]) => {

            // 🔥 NORMALIZACIÓN CLAVE (quita el proj_code del texto)
            const allProjects = (projects || []).map(p => {
              const rawName = p.projname ?? p.proj_name ?? '';

              return {
                projcode: p.projcode ?? p.proj_code,
                projname: rawName.includes('|')
                  ? rawName.split('|').slice(1).join('|').trim()
                  : rawName
              };
            });

            const selected = allProjects.filter(p =>
              userProjectCodes.includes(p.projcode)
            );

            const notSelected = allProjects.filter(p =>
              !userProjectCodes.includes(p.projcode)
            );

            this.projects = [...selected, ...notSelected];
            this.form.get('projects')!.setValue(selected);
          },
          error: () => {
            this.projects = [];
            console.error('Error cargando proyectos del cliente');
          }
        });
      },
      error: () => {
        this.loading = false;
        this.error = 'Error cargando el usuario';
      }
    });
  }

  save(): void {
    if (this.form.invalid) return;

    const formValue = this.form.value;

    const updateData: any = {
      fullName: formValue.fullName,
      email: formValue.email,
      roles: formValue.roles.split(',').map((r: string) => r.trim()),
      projects: formValue.projects
        ? formValue.projects.map((p: any) => p.projcode)
        : []
    };

    if (formValue.password && formValue.password.trim().length > 0) {
      updateData.password = formValue.password;
    }

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
