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
  projects: any[] = [];          // inicializado como arreglo vacío
  dropdownSettings: any;         // se inicializa en ngOnInit

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private userService: UserService,
    private projService: ProjService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Inicializar settings del dropdown
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'projcode',  // debe coincidir con los objetos de projects
      textField: 'projname',
      selectAllText: 'Seleccionar todos',
      unSelectAllText: 'Deseleccionar todos',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };

    // Inicializar form con projects como null (se asignará después)
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      roles: ['', Validators.required],
      cust_code: [{ value: '', disabled: true }],
      projects: [null]
    });

    this.userId = this.route.snapshot.paramMap.get('id')!;
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
          roles: Array.isArray(user.roles) ? user.roles.join(',') : user.roles,
          cust_code: user.cust_code
        });

        this.customerName = user.cust?.name ?? user.cust_code ?? 'Sin cliente';

        const userProjectCodes: string[] = Array.isArray(user.projects)
          ? user.projects.map(p => typeof p === 'string' ? p : p.proj_code)
          : [];

        // Cargar proyectos del cliente
        if (user.cust_code) {
          this.projService.getByCust(user.cust_code).subscribe({
            next: (projects: any[]) => {
              this.projects = (projects || []).map(p => ({
                projcode: p.projcode ?? p.proj_code,
                projname: p.projname ?? p.proj_name
              }));

              // Seleccionar los proyectos del usuario
              const selectedObjects = this.projects.filter(p =>
                userProjectCodes.includes(p.projcode)
              );

              // ⚡ Asignar proyectos al formControl después de cargarlos
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

  save() {
    if (this.form.invalid) return;

    const formValue = this.form.value;

    const updateData = {
      fullName: formValue.fullName,
      email: formValue.email,
      roles: formValue.roles.split(',').map((r: string) => r.trim()),
      projects: formValue.projects ? formValue.projects.map((p: any) => p.projcode) : []
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
