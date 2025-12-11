import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TickService } from '@products/services/tick.service';
import { CustService } from '@dashboard/cust/services/cust.service';
import { ProjService } from '@shared/services/proj.service';

@Component({
  selector: 'app-tick-create-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './tick-create-page.component.html',
})
export class TickCreatePageComponent implements OnInit {

  tickForm!: FormGroup;
  loading = false;
  error: string | null = null;

  customers: any[] = [];
  orders: any[] = [];
  projects: any[] = [];

  file?: File;

  constructor(
    private fb: FormBuilder,
    private tickService: TickService,
    private custService: CustService,
    private projService: ProjService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.tickForm = this.fb.group({
      cust_code: ['', Validators.required],
      project_code: ['', Validators.required],
      order_code: ['', Validators.required],
      tkt_code: ['', Validators.required],
      description: [''],
      order_date: [new Date().toISOString().slice(0, 10), Validators.required],
    });

    this.loadCustomers();

    // Cuando cambia el cliente → cargar proyectos (desde /ordr?cust_code=)
    this.tickForm.get('cust_code')?.valueChanges.subscribe(cust_code => {
      this.projects = [];
      this.orders = [];
      this.tickForm.get('project_code')?.setValue('');
      this.tickForm.get('order_code')?.setValue('');

      if (cust_code) {
        this.projService.getProjectsByCustomer(cust_code).subscribe({
          next: projects => {
            this.projects = projects;
          },
          error: err => console.error('Error cargando proyectos', err)
        });
      }
    });
    
    // Cuando cambia el proyecto → cargar órdenes reales
    this.tickForm.get('project_code')?.valueChanges.subscribe(project_code => {

      this.orders = [];
      this.tickForm.get('order_code')?.setValue('');

      if (project_code) {

        this.custService.getOrdersByProject(project_code).subscribe({
          next: orders => {
            this.orders = orders;
            console.log('Ordenes filtradas por proyecto:', this.orders);
          },
          error: err => console.error('Error cargando órdenes', err)
        });

      }

    });

  }

  loadCustomers() {
    this.custService.getCusts().subscribe({
      next: custs => this.customers = custs,
      error: err => console.error('Error cargando clientes', err)
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.file = file;
  }

  createTick() {
    if (this.tickForm.invalid) {
      this.tickForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.tickService.createTick(this.tickForm.value, this.file).subscribe({
      next: res => {
        this.loading = false;
        this.router.navigate(['/admin/ticks']);
      },
      error: err => {
        console.error('Error al crear tick', err);
        this.error = 'Error al crear tick';
        this.loading = false;
      }
    });
  }
}
