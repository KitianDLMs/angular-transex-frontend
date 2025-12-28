import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@auth/services/auth.service';
import { CustService } from '@dashboard/cust/services/cust.service';
import { OrdrService } from '@shared/services/ordr.service';
import { ProjService } from '@shared/services/proj.service';

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
  projService = inject(ProjService);

  userCustCode: string | null = null;
  customerName: string | null = null;
  customerAddress: string | null = null;

  products: any[] = [];
  selectedProduct: string = '';

  selectedProject: string = '';
  projectOptions: { proj_code: string; proj_descr: string }[] = [];

  page = 1;
  limit = 10;
  totalPages = 1;
  currentYear = new Date().getFullYear();
  loading = false;
  expandedRow: string | null = null;
  groupedProducts: any[] = [];
  expandedGroup: string | null = null;
  availableProjects: any[] = [];

  today = new Date();

  ngOnInit() {
    const user = this.authService.user();
    this.userCustCode = user?.cust_code ?? null;

    if (!this.userCustCode) return;

    this.custService.getCustByCode(this.userCustCode).subscribe(c => {
      this.customerName = c.name;
      this.customerAddress = c.addr_line_1 ?? null;
    });
    this.loadProjects();
    this.loadProducts();
  }  

  loadProjects() {
    if (!this.userCustCode) return;

    this.projService
      .getByCust(this.userCustCode)
      .subscribe(res => {
        console.log('proj', res);      
        this.projectOptions = res;
      });
  }


  toggleGroup(code: string) {
    this.expandedGroup = this.expandedGroup === code ? null : code;
  }

  loadProducts() {
    if (!this.userCustCode) return;

    this.loading = true;
    this.expandedGroup = null;

    this.ordrService
      .getOrdersByCustomerPaginated(
        this.userCustCode,
        this.selectedProject || '',   // 👈 filtro por obra
        this.page,
        this.limit
      )
      .subscribe({
        next: (res) => {
          this.products = res.data;
          this.totalPages = res.totalPages;

          this.groupProducts();
          this.loading = false;
        },
        error: () => {
          this.products = [];
          this.loading = false;
        }
      });
  }


  extractProjectsFromProducts() {
    const map = new Map<string, string>();

    for (const p of this.products) {
      if (p.proj_code && p.proj_descr) {
        map.set(p.proj_code.trim(), p.proj_descr.trim());
      }
    }
    
    this.availableProjects = Array.from(map, ([proj_code, proj_descr]) => ({ proj_code, proj_descr }));
  }

  onSelectProject() {
    this.page = 1;
    this.loadProducts();
  }

  clearFilter() {
    this.selectedProject = '';
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

  groupProducts() {
    const map = new Map<string, any>();

    for (const p of this.products) {
      if (!map.has(p.product_code)) {
        map.set(p.product_code, {
          product_code: p.product_code,
          product_desc: p.product_desc,
          totalQuantity: 0,
          items: []
        });
      }

      const group = map.get(p.product_code);
      group.items.push(p);
      group.totalQuantity += Number(p.quantity);
    }

    this.groupedProducts = Array.from(map.values());
  }
}
