import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '@dashboard/users/services/user.service';
import { ProjService } from '@shared/services/proj.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-user-edit-page',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, NgMultiSelectDropDownModule],
  templateUrl: './user-edit-page.component.html',
})
export class UserEditPageComponent implements OnInit {

  form!: FormGroup;
  loading = false;
  error = '';
  userId!: string;
  customerName = '';
  projects: any[] = [];
  dropdownSettings = {
    singleSelection: false,
    idField: 'projcode',
    textField: 'projname',
    selectAllText: 'Seleccionar todos',
    unSelectAllText: 'Deseleccionar todos',
    itemsShowLimit: 3,
    allowSearchFilter: true
  };

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private userService: UserService,
    private projService: ProjService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id')!;
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      roles: ['', Validators.required],
      cust_code: [{ value: '', disabled: true }],
      projects: [[]]
    });

    this.loadUser();
  }

  loadUser() {
    this.loading = true;

    this.userService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.loading = false;

        console.log('🚀 USUARIO RECIBIDO DEL BACKEND:', user);

        this.form.patchValue({
          fullName: user.fullName,
          email: user.email,
          roles: Array.isArray(user.roles) ? user.roles.join(',') : user.roles,
          cust_code: user.cust_code
        });

        this.customerName = user.cust?.name ?? user.cust_code ?? 'Sin cliente';

        const userProjectCodes: string[] = Array.isArray(user.projects)
          ? user.projects.map(p => typeof p === 'string' ? p : p.proj_code)
          : [];

        console.log('📌 CÓDIGOS DE PROYECTOS DEL USUARIO:', userProjectCodes);

        if (user.cust_code) {
          this.projService.getByCust(user.cust_code).subscribe({
            next: (projects: any[]) => {
              console.log('📦 TODOS LOS PROYECTOS DEL CLIENTE:', projects);

              this.projects = projects.map(p => ({
                projcode: p.projcode ?? p.proj_code,
                projname: p.projname ?? p.proj_name
              }));

              const selectedObjects = this.projects.filter(p =>
                userProjectCodes.includes(p.projcode)
              );

              console.log('✅ PROYECTOS SELECCIONADOS PARA EL DROPDOWN:', selectedObjects);

              this.form.get('projects')!.setValue(selectedObjects);
            },
            error: () => {
              console.error("Error cargando proyectos del cliente");
              this.projects = [];
            }
          });
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Error cargando el usuario';
      }
    });
  }

  loadProjects(cust_code: string, userProjectCodes: string[]) {
    this.projService.getByCust(cust_code).subscribe({
      next: (projects: any[]) => {
        this.projects = projects.map(p => ({
          projcode: p.projcode ?? p.proj_code,
          projname: p.projname ?? p.proj_name
        }));

        const selectedObjects = this.projects.filter(p =>
          userProjectCodes.includes(p.projcode)
        );

        this.form.get('projects')!.setValue(selectedObjects);
      },
      error: () => {
        console.error("Error cargando proyectos del cliente");
        this.projects = [];
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
      // enviamos solo los códigos de proyecto al backend
      projects: formValue.projects.map((p: any) => p.projcode)
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
