import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { OrdrService } from '@shared/services/ordr.service';
import { Ordr } from 'src/app/ordr/interfaces/ordr.interface';

@Component({
  selector: 'app-ordr-edit-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './ordr-edit-page.component.html',
})
export class OrdrEditPageComponent implements OnInit {

  form!: FormGroup;
  loading = false;
  error = '';
  order_code!: string;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private ordrService: OrdrService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.order_code = this.route.snapshot.paramMap.get('order_code')!;

    this.form = this.fb.group({
      cust_code: [''],
      order_date: [''],
      proj_code: [''],            
      order_code: [''],
      ship_cust_code: [''],
      ref_cust_code: [''],
      po: [''],
      cust_job_num: [''],
      setup_date: [''],
    });

    this.loadOrdr();
  }

  loadOrdr() {
    this.loading = true;

    this.ordrService.getOne(this.order_code).subscribe({
      next: (o: Ordr) => {
        this.loading = false;
        this.form.patchValue({
          order_code: o.order_code ?? '',
          order_date: o.order_date ? o.order_date.substring(0,10) : '',
          cust_code: o.cust_code ?? '',
          proj_code: o.proj_code ?? '',          
          ship_cust_code: o.ship_cust_code ?? '',
          ref_cust_code: o.ref_cust_code ?? '',
          po: o.po ?? '',
          cust_job_num: o.cust_job_num ?? '',
          setup_date: o.setup_date ? o.setup_date.substring(0,10) : ''
        });
      },
      error: () => {
        this.loading = false;
        this.error = 'Error cargando la orden';
      }
    });
  }

  save() {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const updateData = {
      ...raw,
      order_date: new Date(raw.order_date),
      setup_date: raw.setup_date ? new Date(raw.setup_date) : undefined,
    };
    console.log(this.form.value)
    this.ordrService.updateOrdr(this.order_code, updateData).subscribe({
      next: () => {
        alert('Orden actualizada');
        this.router.navigate(['/admin/ordr']);
      },
      error: (err) => {
        console.error('Error actualizando:', err);
        this.error = 'Error actualizando la orden';
      }
    });
  }
}
