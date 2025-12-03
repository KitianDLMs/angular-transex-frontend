import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { CustService } from '@dashboard/cust/services/cust.service';
import { OrdrService } from '@shared/services/ordr.service';

@Component({
  selector: 'app-ordr-create-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './ordr-create-page.component.html',
})
export class OrdrCreatePageComponent implements OnInit {

  form!: FormGroup;
  loading = false;
  error: string | null = null;
  customers: any[] = [];

  constructor(
    private fb: FormBuilder,
    private custService: CustService,
    private ordrService: OrdrService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.form = this.fb.group({
      order_date: [new Date(), Validators.required],
      order_code: ['', Validators.required],
      cust_code: ['', Validators.required],
      order_type: [''],
      proj_code: [''],
      memo_rsn_code: [''],
      instr: ['']
    });

    this.loadCustomers();
  }

  loadCustomers() {
    this.custService.getCusts().subscribe({
      next: (list) => this.customers = list,
      error: () => console.error('Error cargando clientes')
    });
  }

  create() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    const selectedCustomer = this.customers.find(
      c => c.cust_code === this.form.value.cust_code
    );

    const payload = {
      ...this.form.value,              
      order_date: new Date(this.form.value.order_date),
      cust_name: selectedCustomer?.name ?? ''
    };

    this.ordrService.createOrdr(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/admin/ordr']);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error al crear la orden';
        this.loading = false;
      },
    });
  }
}
