import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '@auth/services/auth.service';
import { CustService } from '@dashboard/cust/services/cust.service';
import { ProjService } from '@shared/services/proj.service';
import {
  ProdReportService,
  ProductReport
} from '@shared/services/prod-report.service';
import { Cust } from '@dashboard/cust/interfaces/cust.interface';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule  
  ],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent implements OnInit {

  authService = inject(AuthService);
  custService = inject(CustService);
  projService = inject(ProjService);
  prodReportService = inject(ProdReportService);

  currentUser: any = null;
  userCustCode: string | null = null;
  customerName: string | null = null;
  customerAddress: string | null = null;

  products: ProductReport[] = [];

  selectedProject = '';
  projectOptions: { proj_code: string; proj_name: string }[] = [];

  page = 1;
  limit = 10;
  totalPages = 1;
  loading = false;

  expandedGroup: string | null = null;
  today = new Date();
  currentYear = new Date().getFullYear();
  
  userCustCodes: string[] = [];
  selectedCustCode: string | null = null;
  customersData: { [code: string]: { name: string; addr: string } } = {};

  ngOnInit() {
    this.currentUser = this.authService.user();
    if (!this.currentUser) return;

    this.userCustCodes = this.currentUser.cust_codes || [];

    if (this.userCustCodes.length <= 1) {
      this.selectedCustCode = this.userCustCodes[0] || this.currentUser.cust_code;
      this.userCustCode = this.selectedCustCode;

      this.custService.getCustByCode(this.userCustCode!).subscribe(cust => {
        this.customersData[this.userCustCode!] = {
          name: cust.name || 'Sin nombre',
          addr: cust.addr_line_1 || 'Sin dirección'
        };
        this.loadCustomerData(this.userCustCode!);
      });
    } else {
      this.selectedCustCode = this.userCustCodes[0];
      this.userCustCode = this.selectedCustCode;

      const observables = this.userCustCodes.map(code =>
        this.custService.getCustByCode(code)
      );

      forkJoin(observables).subscribe(results => {
        results.forEach((cust, i) => {
          const code = this.userCustCodes[i];
          this.customersData[code] = {
            name: cust.name || 'Sin nombre',
            addr: cust.addr_line_1 || 'Sin dirección'
          };
        });

        this.loadCustomerData(this.selectedCustCode!);
      });
    }
  }

  onCustomerChange() {
    if (!this.selectedCustCode) return;
    this.loadCustomerData(this.selectedCustCode);
  }

  loadCustomerData(custCode: string) {
    this.userCustCode = custCode;

    const data = this.customersData[custCode];
    if (data) {
      this.customerName = data.name;
      this.customerAddress = data.addr;
    } else {
      this.loadCustomer(); // para usuario final con un solo cliente
    }

    this.loadProjects();
    this.loadProducts();
  }

  loadCustomer() {
    this.custService.getCustByCode(this.userCustCode!).subscribe(c => {
      this.customerName = c.name;
      this.customerAddress = c.addr_line_1 ?? null;
    });
  }

  loadProjects() {
    const allowedProjects = this.currentUser?.projects ?? [];

    this.projService.getByCust(this.userCustCode!).subscribe(projects => {
      const map = new Map<string, { proj_code: string; proj_name: string }>();

      projects.forEach(p => {
        if (!p.projcode || !p.projname) return;

        const code = p.projcode.trim();
        const name = p.projname.trim();

        if (!allowedProjects.includes(code)) return;

        if (!map.has(code)) {
          map.set(code, { proj_code: code, proj_name: name });
        }
      });

      this.projectOptions = Array.from(map.values());
    });
  }

  loadProducts() {
    this.loading = true;
    this.expandedGroup = null;

    const filters: any = {
      custCode: this.userCustCode,
      page: this.page,
      limit: this.limit,
    };

    if (this.selectedProject) {
      filters.projCode = this.selectedProject;
    }

    this.prodReportService.getReport(filters).subscribe({
      next: resp => {
        const map: Record<string, ProductReport> = {};

        (resp.data as ProductReport[]).forEach(p => {

        if (!map[p.codigo]) {
          map[p.codigo] = {
            codigo: p.codigo,
            producto: p.producto,
            respaldado: 0,
            utilizado: 0,
            saldo: 0,
            ordenes: []
          };
        }

        const ordenDetalle = {
          ordencompra: p.ordencompra,
          respaldado: Number(p.respaldado),
          utilizado: Number(p.utilizado),
          saldo: Number(p.saldo),
        };

        const existing = map[p.codigo].ordenes.find(
          x => x.ordencompra === ordenDetalle.ordencompra
        );

        if (existing) {
          existing.respaldado += ordenDetalle.respaldado;
          existing.utilizado += ordenDetalle.utilizado;
          existing.saldo = existing.respaldado - existing.utilizado;
        } else {
          map[p.codigo].ordenes.push(ordenDetalle);
        }

        map[p.codigo].respaldado = map[p.codigo].ordenes
          .reduce((sum, x) => sum + x.respaldado, 0);

        map[p.codigo].utilizado = map[p.codigo].ordenes
          .reduce((sum, x) => sum + x.utilizado, 0);

        map[p.codigo].saldo =
          map[p.codigo].respaldado -
          map[p.codigo].utilizado;

      });
        this.products = Object.values(map);
        this.page = Number(resp.page);
        this.totalPages = Number(resp.totalPages);
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.products = [];
        this.loading = false;
      },
    });
  }

  toggleGroup(code: string) {
    this.expandedGroup = this.expandedGroup === code ? null : code;
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
}
