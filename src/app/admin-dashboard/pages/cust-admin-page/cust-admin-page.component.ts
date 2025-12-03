import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CustService } from '@dashboard/cust/services/cust.service';
import { Cust } from '@dashboard/cust/interfaces/cust.interface';
import { CustomerDetailsComponent } from './cust-details/cust-details.component';

@Component({
  selector: 'app-cust-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CustomerDetailsComponent],
  templateUrl: './cust-admin-page.component.html'
})
export class CustEditComponent implements OnInit {

  custForm!: FormGroup;
  cust: Cust | null = null;
  custCode: string = '';

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private custService: CustService,
    private router: Router
  ) {}

  ngOnInit() {
    const code = this.route.snapshot.paramMap.get('cust_code')!;
    
    this.custService.getCustByCode(code).subscribe(c => {
      console.log('this.cust', this.cust);      
      this.cust = c;
      console.log('c',c);

    });
    this.loadCust();
  }
  
  loadCust() {
    this.custService.getCustByCode(this.custCode).subscribe({
      next: c => {
        console.log('CUST LOADED:', c);
        this.cust = c;
        this.initForm(c);
      },
      error: err => {
        console.error('ERROR cargando cliente:', err);
      }
    });
  }

  initForm(cust: Cust) {
    this.custForm = this.fb.group({
      name: [cust.name],
      contct_name: [cust.contct_name],
      phone_num_1: [cust.phone_num_1],
      addr_line_1: [cust.addr_line_1],
      addr_line_2: [cust.addr_line_2],
      addr_city: [cust.addr_city],
      addr_state: [cust.addr_state],
      addr_cntry: [cust.addr_cntry],
      addr_postcd: [cust.addr_postcd]
    });
  }

  save() {
    if (!this.cust) {
      console.warn('No hay cliente cargado para actualizar.');
      return;
    }

    if (this.custForm.invalid) {
      console.warn('Formulario inválido.');
      return;
    }
    
    this.custService.updateCust(this.cust.cust_code, this.custForm.value).subscribe({
      next: () => {
        console.log('Cliente actualizado!');
        this.router.navigate(['/admin/customer']);
      },
      error: err => console.error(err)
    });
  }
}
