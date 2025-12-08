import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CustService } from '@dashboard/cust/services/cust.service';
import { OrdrService } from '@shared/services/ordr.service';
import { ProjService } from '@shared/services/proj.service';


@Component({
  selector: 'app-create-ordr',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './ordr-create-page.component.html',
})
export class CreateOrdrComponent implements OnInit {
  form!: FormGroup;
  customers: any[] = [];
  projects: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private customerService: CustService,
    private projectService: ProjService,
    private ordrService: OrdrService 
  ) {}

  ngOnInit() {
  // TS: inicialización
  this.form = this.fb.group({
    cust_code: ['', Validators.required],
    proj_code: [{ value: '', disabled: true }], // inicia deshabilitado
    order_date: ['', Validators.required],
    order_code: ['', Validators.required],
    order_type: [''],
    instr: ['']
  });


    // cargar clientes
    this.customerService.getCusts().subscribe((data) => {
      this.customers = data;
    });

    // detectar cambios en cliente
    this.form.get('cust_code')?.valueChanges.subscribe(custCode => {
    const projControl = this.form.get('proj_code');
    if (custCode) {
      projControl?.enable(); // habilita el select
      this.projectService.getByCust(custCode).subscribe(data => {
        this.projects = data;
      });
    } else {
      projControl?.reset();   // limpia selección
      projControl?.disable(); // deshabilita el select
      this.projects = [];
    }
  });

  }

  create() {
    if (this.form.invalid) {
      this.error = 'Por favor complete los campos obligatorios.';
      return;
    }

    this.loading = true;
    this.error = null;

    const dto = this.form.getRawValue();

    this.ordrService.createOrdr(dto).subscribe({
      next: () => {
        this.loading = false;        
        this.router.navigate(['/admin/ordr']);        
        alert('Orden creada correctamente');
        this.form.reset();
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Error al crear la orden.';
      }
    });
  }

}
