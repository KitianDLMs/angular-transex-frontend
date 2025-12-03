import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustService } from '@dashboard/cust/services/cust.service';

@Component({
  selector: 'app-cust-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './cust-create-page.component.html'
})
export class CustCreatePageComponent {

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private custService: CustService,
    private router: Router
  ) {
    console.log('CustCreatePageComponent');    
    this.form = this.fb.group({
      cust_code: ['', Validators.required],
      name: [''],
      sort_name: [''],
      addr_line_1: [''],
      addr_line_2: [''],
      addr_city: [''],
      addr_state: [''],
      addr_cntry: [''],
      addr_postcd: [''],
      contct_name: [''],
      phone_num_1: [''],
      phone_num_2: [''],
      phone_num_3: [''],
      phone_num_4: [''],
      setup_date: [new Date()]
    });
  }

  create() {
    if (this.form.invalid) {
      console.log('Formulario inválido', this.form.value);
      return;
    }
    console.log('Formulario valido ');    
    this.custService.createCust(this.form.value).subscribe({
      next: () => {
        console.log('Cliente creado con éxito');
        this.router.navigate(['/admin/customer']);
      },
      error: err => {
        console.error('Error al crear cliente:', err);
      }
    });
  }
}
