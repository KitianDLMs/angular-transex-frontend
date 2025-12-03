import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Cust } from '@dashboard/cust/interfaces/cust.interface';
import { CustService } from '@dashboard/cust/services/cust.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'customer-details',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './cust-details.component.html'
})
export class CustomerDetailsComponent implements OnInit {

  @Input() customer!: Cust;
  form: FormGroup;
  wasSaved = false;

  constructor(
    private fb: FormBuilder,
    private custService: CustService,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      name: [''],
      contct_name: [''],
      phone_num_1: [''],
      addr_line_1: [''],
      addr_line_2: [''],
      addr_city: [''],
      addr_state: [''],
      addr_cntry: [''],
      addr_postcd: [''],
    });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const custCode = params.get('custCode'); // viene de la URL
      if (custCode) {
        this.loadCustomer(custCode);
      }
    });
  }

  private loadCustomer(custCode: string) {
    this.custService.getCustByCode(custCode).subscribe({
      next: (resp) => {
        this.customer = resp;

        // Pasa los valores al formulario
        this.form.patchValue({
          name: resp.name,
          contct_name: resp.contct_name,
          phone_num_1: resp.phone_num_1,
          addr_line_1: resp.addr_line_1,
          addr_line_2: resp.addr_line_2,
          addr_city: resp.addr_city,
          addr_state: resp.addr_state,
          addr_cntry: resp.addr_cntry,
          addr_postcd: resp.addr_postcd
        });
      },
      error: (err) => {
        console.error('Error cargando cliente:', err);
      }
    });
  }

  save() {
    if (!this.customer || this.form.invalid) return;

    this.custService.updateCust(this.customer.cust_code, this.form.value)
      .subscribe({
        next: () => {
          this.wasSaved = true;
          setTimeout(() => this.wasSaved = false, 2000);
        },
        error: (err) => {
          console.error("BACKEND ERROR →", err.error);
          console.log("DETALLE COMPLETO →", JSON.stringify(err.error, null, 2));
        }
      });
  }
}
