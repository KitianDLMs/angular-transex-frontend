import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CustService } from '@dashboard/cust/services/cust.service';
import { ProjService } from '@shared/services/proj.service';
import { Proj } from 'src/app/proj/interfaces/proj.interface';

@Component({
  selector: 'app-proj-create-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './proj-create-page.component.html',
})
export class ProjCreatePageComponent implements OnInit {

  form!: FormGroup;
  loading = false;
  error: string | null = null;
  customers: any[] = [];

  constructor(
    private fb: FormBuilder,
    private custService: CustService,
    private projService: ProjService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      cust_code: ['', Validators.required],
      proj_code: ['', Validators.required],
      proj_name: ['', Validators.required],
      sort_name: [''],
      ship_cust_code: [''],
      ref_cust_code: [''],
      po: [''],
      cust_job_num: [''],
      setup_date: [new Date(), Validators.required],
    });

    this.loadCustomers();
  }

  loadCustomers() {
    this.custService.getCusts().subscribe({
      next: custs => this.customers = custs,
      error: err => console.error('Error cargando clientes', err)
    });
  }

  create() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.projService.create(this.form.value).subscribe({
      next: (proj: Proj) => {
        this.loading = false;
        this.router.navigate(['/admin/projects']); // ruta de lista de proyectos
      },
      error: (err: any) => {
        console.error('Error al crear proyecto', err);
        this.error = 'Error al crear proyecto';
        this.loading = false;
      }
    });
  }
}
