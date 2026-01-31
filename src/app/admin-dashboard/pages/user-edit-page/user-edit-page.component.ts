import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

import { UserService } from '@dashboard/users/services/user.service';
import { ProjService } from '@shared/services/proj.service';
import { CustService } from '@dashboard/cust/services/cust.service';

@Component({
  selector: 'app-user-edit-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './user-edit-page.component.html'
})
export class UserEditPageComponent implements OnInit {

  form!: FormGroup;
  loading = false;
  error = '';
  userId!: string;

  customerName = '';
  custCodeNames: Record<string, string> = {};

  projects: { code: string; name: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private userService: UserService,
    private projService: ProjService,
    private custService: CustService,
    private router: Router
  ) {}

  ngOnInit(): void {

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{1,15}$/;

    this.form = this.fb.group({
      fullName: ['', Validators.required],
      rut: ['', [
        Validators.required,
        Validators.pattern(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$|^\d{7,8}-[\dkK]$/)
      ]],
      email: ['', [Validators.required, Validators.email]],
      roles: ['', Validators.required],      
      cust_code: [{ value: '', disabled: true }, [
        Validators.required,
        Validators.maxLength(13)
      ]],
      cust_codes: [[]],  
      custCodeInput: [
        '',
        [Validators.required, Validators.maxLength(13)]
      ],
      projects: [[]],
      password: ['', [Validators.maxLength(15), Validators.pattern(passwordRegex)]]
    });

    this.form.get('roles')?.valueChanges.subscribe(role =>
      this.toggleCustCodesByRole(role)
    );

    // 🔥 CUANDO ADMIN AGREGA / QUITA CLIENTES
    this.form.get('cust_codes')?.valueChanges.subscribe(codes => {
      if (codes?.length) {
        this.loadProjectsByCustCodes(codes, this.form.get('projects')?.value || []);
      } else {
        this.projects = [];
        this.form.get('projects')?.setValue([]);
      }
    });

    this.userId = this.route.snapshot.paramMap.get('id')!;
    this.loadUser();
  }

  get sortedProjects() {
    const selectedProjects = this.form.get('projects')?.value || [];
    return this.projects.slice().sort((a, b) => {
      console.log(this.projects);    
      const aSelected = selectedProjects.includes(a.code) ? 0 : 1;
      const bSelected = selectedProjects.includes(b.code) ? 0 : 1;
      return aSelected - bSelected;
    });
  }

  loadUser(): void {
    this.loading = true;

    this.userService.getUserById(this.userId).subscribe({
      next: user => {
        this.loading = false;

        const role = Array.isArray(user.roles) ? user.roles[0] : user.roles;

        this.form.patchValue({
          fullName: user.fullName,
          email: user.email,
          roles: role,
          rut: user.rut,
          cust_code: user.cust_code
        });
        
        this.customerName = user.cust?.name ?? '';
        this.toggleCustCodesByRole(role);
            
        if (user.cust_codes?.length) {
          this.form.get('cust_codes')?.setValue(user.cust_codes);

          user.cust_codes.forEach((code: string) => {
            this.custService.getCustByCode(code).subscribe(cust => {
              if (cust) this.custCodeNames[code] = cust.name;
            });
          });
        }

        const selectedProjects =
          user.projects?.map((p: any) =>
            typeof p === 'string' ? p : p.proj_code
          ) || [];

        if (role === 'user' && user.cust_code) {
          this.loadProjectsBySingleCust(user.cust_code, selectedProjects);
        }

        if ((role === 'admin' || role === 'super-user') && user.cust_codes?.length) {
          this.loadProjectsByCustCodes(user.cust_codes, selectedProjects);
        }
      }
    });
  }

  loadProjectsBySingleCust(custCode: string, selected: string[]) {
    this.projService.getByCust(custCode).subscribe(projects => {
      this.projects = projects.map(p => ({
        code: p.projcode,
        name: p.projname.split('|').pop()?.trim()
      }));
      this.form.get('projects')?.setValue(selected);
    });
  }

  loadProjectsByCustCodes(codes: string[], selected: string[]) {
    forkJoin(codes.map(code => this.projService.getByCust(code)))
      .subscribe(results => {

        const map = new Map<string, any>();

        results.flat().forEach(p => {
          map.set(p.projcode, {
            code: p.projcode,
            name: p.projname.split('|').pop()?.trim()
          });
        });

        this.projects = Array.from(map.values());
        this.form.get('projects')?.setValue(selected);
      });
  }

  toggleCustCodesByRole(role: string) {
    const one = this.form.get('cust_code');
    const many = this.form.get('cust_codes');
    const input = this.form.get('custCodeInput');

    if (role === 'user') {
      one?.enable();
      many?.disable(); many?.reset();
      input?.disable(); input?.reset();
    } else {
      many?.enable();
      input?.enable();
      one?.disable(); one?.reset();
    }
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

  addCustCode() {
    const code = this.form.get('custCodeInput')?.value?.trim();
    if (!code) return;

    const current = this.form.get('cust_codes')?.value || [];
    if (current.includes(code)) return;

    this.custService.getCustByCode(code).subscribe(cust => {
      if (!cust) return;
      this.custCodeNames[code] = cust.name;
      this.form.get('cust_codes')?.setValue([...current, code]);
      this.form.get('custCodeInput')?.reset();
    });
  }

  removeCustCode(code: string) {
    delete this.custCodeNames[code];
    this.form.get('cust_codes')?.setValue(
      this.form.get('cust_codes')?.value.filter((c: string) => c !== code)
    );
  }

  save(): void {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();

    const payload: any = {
      fullName: raw.fullName,
      email: raw.email,
      roles: [raw.roles],
      rut: raw.rut,
      projects: raw.projects
    };

    if (raw.roles === 'user') payload.cust_code = raw.cust_code;
    else payload.cust_codes = raw.cust_codes;

    if (raw.password) payload.password = raw.password;

    this.userService.updateUser(this.userId, payload).subscribe({
      next: () => this.router.navigate(['/admin/users'])
    });
  }

  onCustCodeInput(event: Event, controlName: 'cust_code' | 'custCodeInput' = 'cust_code') {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '');

    this.form.get(controlName)?.setValue(value, { emitEvent: false });
  }

  onRutInput(event: any) {
    const input = event.target;
    input.value = input.value
      .replace(/[^0-9kK-]/g, '')
      .toUpperCase()
      .slice(0, 10);
  }

  custCodeInputName: string | null = null;

  checkCustCodeMultiple() {
    const control = this.form.get('custCodeInput');
    const code = control?.value;

    if (!code || control?.invalid) return;

    this.custService.getCustByCode(code).subscribe({
      next: (customer) => {
        this.custCodeInputName = customer.name;
        control?.setErrors(null);
      },
      error: () => {
        this.custCodeInputName = null;
        control?.setErrors({ notFound: true });
      }
    });
  }

}
