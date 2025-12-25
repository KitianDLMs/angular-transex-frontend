import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@auth/services/auth.service';
import { CustService } from '@dashboard/cust/services/cust.service';
import { OrdrService } from '@shared/services/ordr.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent implements OnInit {

  authService = inject(AuthService);
  custService = inject(CustService);
  ordrService = inject(OrdrService);

  userCustCode: string | null = null;
  customerName: string | null = null;
  customerAddress: string | null = null;

  products: any[] = [];
  selectedProduct: string = '';

  page = 1;
  limit = 10;
  totalPages = 1;
  currentYear = new Date().getFullYear();
  loading = false;
  expandedRow: string | null = null;

  today = new Date();

  ngOnInit() {
    const user = this.authService.user();
    this.userCustCode = user?.cust_code ?? null;

    if (!this.userCustCode) return;

    this.custService.getCustByCode(this.userCustCode).subscribe(c => {
      this.customerName = c.name;
      this.customerAddress = c.addr_line_1 ?? null;
    });

    this.loadProducts();
  }  

  toggleRow(code: string) {
    this.expandedRow = this.expandedRow === code ? null : code;
  }

  loadProducts() {
    if (!this.userCustCode) return;

    this.loading = true;

    this.ordrService
      .getOrdersByCustomerPaginated(
        this.userCustCode,
        this.selectedProduct || '',
        this.page,
        this.limit
      )
      .subscribe({
        next: (res) => {
          this.products = res.data;
          this.totalPages = res.totalPages;
          this.loading = false;
        },
        error: () => {
          this.products = [];
          this.loading = false;
        }
      });
  }

  onFilterChange() {
    this.page = 1;
    this.loadProducts();
  }

  clearFilter() {
    this.selectedProduct = '';
    this.page = 1;
    this.loadProducts();
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadProducts();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadProducts();
    }
  }
}
