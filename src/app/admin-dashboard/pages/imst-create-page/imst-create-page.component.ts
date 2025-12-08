import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CustService } from '@dashboard/cust/services/cust.service';
import { ProjService } from '@shared/services/proj.service';
import { Imst } from '@dashboard/imst/interfaces/imst.interface';
import { ProdService } from '@shared/services/prod.service';

@Component({
  selector: 'app-prod-create-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './imst-create-page.component.html',
})
export class ImstCreatePageComponent implements OnInit {

  form!: FormGroup;
  loading = false;
  error: string | null = null;

  customers: any[] = [];
  projects: any[] = [];

  constructor(
    private fb: FormBuilder,
    private custService: CustService,
    private projService: ProjService,
    private prodService: ProdService,
    private router: Router
  ) {}

  ngOnInit(): void {
  // Formulario
  this.form = this.fb.group({
    cust_code: ['', Validators.required],
    proj_code: ['', Validators.required],
    item_code: ['', Validators.required],
    descr: ['', Validators.required],
    short_descr: [''],
    item_cat: [''],
    price_uom: ['', Validators.required],
    order_uom: ['', Validators.required],
    setup_date: [new Date(), Validators.required],
  });

  this.loadCustomers();

  this.form.get('cust_code')?.valueChanges.subscribe((custCode: string) => {
    this.form.get('proj_code')?.setValue(''); // limpiar proyecto seleccionado

    if (!custCode) {
      this.projects = [];
      return;
    }

    this.projService.getByCustomer(custCode).subscribe({
      next: (projs) => (this.projects = projs),
      error: () => {
        console.error('Error cargando proyectos por cliente');
        this.projects = [];
      }
    });
  });
}


  loadCustomers() {
    this.custService.getCusts().subscribe({
      next: custs => (this.customers = custs),
      error: () => console.error('Error cargando clientes'),
    });
  }

  create() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    console.log(this.form);    
    this.loading = true;

    this.prodService.create(this.form.getRawValue()).subscribe({
      next: (prod: Imst) => {
        this.loading = false;
        this.router.navigate(['/admin/prod']);
      },
      error: (err: any) => {
        console.error('Error al crear producto', err);
        this.error = 'Error al crear producto';
        this.loading = false;
      },
    });
  }
}
