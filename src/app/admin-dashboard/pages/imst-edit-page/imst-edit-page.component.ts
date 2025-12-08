import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { ProdService } from '@shared/services/prod.service';
import { Imst } from '@dashboard/imst/interfaces/imst.interface';

@Component({
  selector: 'app-prod-edit-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './imst-edit-page.component.html',
})
export class ImstEditPageComponent implements OnInit {

  form!: FormGroup;
  loading = false;
  error = '';
  item_code!: string;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private prodService: ProdService,
    private router: Router
  ) {}

  ngOnInit(): void {

    // 🚨 importa: los item_code vienen con espacios → trim()
    this.item_code = this.route.snapshot.paramMap.get('item_code')!.trim();

    this.form = this.fb.group({
      item_code: [{ value: '', disabled: true }],
      descr: [''],
      short_descr: [''],
      invy_flag: [false],
      price_uom: [''],
      order_uom: [''],
      slump: [''],
      slump_uom: [''],
      strgth: [''],
      strgth_uom: [''],
      update_date: [''],
    });

    this.loadProduct();
  }

  loadProduct() {
    this.loading = true;

    this.prodService.getOne(this.item_code).subscribe({
      next: (p: Imst) => {
        this.loading = false;        
        this.form.patchValue({
          item_code: p.item_code?.trim() ?? '',
          descr: p.descr ?? '',
          short_descr: p.short_descr ?? '',
          invy_flag: p.invy_flag ?? false,
          price_uom: p.price_uom ?? '',
          order_uom: p.order_uom ?? '',
          slump: p.slump ?? '',
          slump_uom: p.slump_uom ?? '',
          strgth: p.strgth ?? '',
          strgth_uom: p.strgth_uom ?? '',
          update_date: p.update_date ? p.update_date.substring(0,10) : '',
        });
      },
      error: () => {
        this.loading = false;
        this.error = 'Error cargando producto';
      }
    });
  }

  save() {
    if (this.form.invalid) return;

    const raw = this.form.getRawValue();
    const dto = {
      ...raw,
      slump: raw.slump !== '' ? Number(raw.slump) : null,
      strgth: raw.strgth !== '' ? Number(raw.strgth) : null,
    };

    this.prodService.update(this.item_code, dto).subscribe({
      next: () => {
        alert('Producto actualizado');
        this.router.navigate(['/admin/prod']);
      },
      error: (err) => {
        console.error('Error actualizando:', err);
        this.error = 'Error actualizando producto';
      }
    });
  }
}
