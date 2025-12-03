import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CustService } from '@dashboard/cust/services/cust.service';
import { Cust } from '@dashboard/cust/interfaces/cust.interface';
import { HttpClientModule } from '@angular/common/http';
import { CustTableComponent } from '@dashboard/cust/components/cust-table.component';

@Component({
  selector: 'app-cust-management',
  templateUrl: 'custs-admin-page.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, HttpClientModule, CustTableComponent]
})
export class CustsAdminPageComponent implements OnInit {
  custs: Cust[] = [];
  selectedCust: Cust | null = null;
  custForm: FormGroup;

  trackByCustCode(index: number, cust: any): string {
    return cust.cust_code;
  }

  constructor(private custService: CustService, private fb: FormBuilder,  private router: Router) {
    this.custForm = this.fb.group({
      cust_code: [''],
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
      phone_num_4: ['']
    });
  }

  ngOnInit(): void {   
    this.loadCusts();
  }

  loadCusts() {
    this.custService.getCusts().subscribe({
      next: (data) => this.custs = data,
      error: (err) => console.error(err)
    });
  }

  selectCust(cust: Cust) {
    this.router.navigate(['/admin/customer', cust.cust_code]);
  }

  saveCust() {
    const custData: Partial<Cust> = this.custForm.value;

    if (this.selectedCust) {      
      this.custService.updateCust(this.selectedCust.cust_code, custData).subscribe({
        next: (updated) => {
          this.loadCusts();
          this.selectedCust = null;
          this.custForm.reset();
        },
        error: (err) => console.error(err)
      });
    } else {      
      this.custService.createCust(custData).subscribe({
        next: (created) => {
          this.loadCusts();
          this.custForm.reset();
        },
        error: (err) => console.error(err)
      });
    }
  }

  deleteCust(cust_code: string) {
    if (confirm('¿Seguro quieres eliminar este cliente?')) {
      this.custService.deleteCust(cust_code).subscribe({
        next: () => this.loadCusts(),
        error: (err) => console.error(err)
      });
    }
  }

  cancelEdit() {
    this.selectedCust = null;
    this.custForm.reset();
  }
}
