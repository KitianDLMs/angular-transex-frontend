import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@auth/services/auth.service';
import { CustService } from '@dashboard/cust/services/cust.service';
import { ProjService } from '@shared/services/proj.service';
import { ProdReportService, ProductReport, OrderDetail } from '@shared/services/prod-report.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
  userProjects: string[] = [];
  products: ProductReport[] = [];

  selectedProject: string = '';
  projectOptions: { proj_code: string; proj_name: string }[] = [];

  page = 1;
  limit = 10;
  totalPages = 1;
  currentYear = new Date().getFullYear();

  loading = false;
  expandedGroup: string | null = null;
  today = new Date();

  ngOnInit() {
    this.currentUser = this.authService.user();
    if (!this.currentUser) return;

    this.userCustCode = this.currentUser.cust_code ?? null;
    if (!this.userCustCode) return;

    this.loadCustomer();
    this.loadProjects();
    this.loadProducts();
  }

  loadCustomer() {
    if (!this.userCustCode) return;
    this.custService.getCustByCode(this.userCustCode).subscribe(c => {
      this.customerName = c.name;
      this.customerAddress = c.addr_line_1 ?? null;
    });
  }

  loadProjects(): void {
    if (!this.userCustCode) return;

    const allowedProjects = this.authService.user()?.projects || [];

    this.projService.getByCust(this.userCustCode).subscribe({
      next: (projects) => {
        const map = new Map<string, { proj_code: string; proj_name: string }>();

        projects.forEach(p => {
          if (!p.projcode || !p.projname) return;
          const code = p.projcode.trim();
          const name = p.projname.trim();
          if (!allowedProjects.includes(code)) return;

          if (!map.has(code)) {
            map.set(code, { proj_code: code, proj_name: name });
          } else if (name.length > map.get(code)!.proj_name.length) {
            map.set(code, { proj_code: code, proj_name: name });
          }
        });

        this.projectOptions = Array.from(map.values());
      },
      error: err => {
        console.error('Error cargando obras:', err);
        this.projectOptions = [];
      }
    });
  }

  loadProducts() {
    if (!this.userCustCode) return;

    this.loading = true;
    this.expandedGroup = null;

    const filters: any = { 
      custCode: this.userCustCode,
      page: this.page,
      limit: this.limit,
    };
    if (this.selectedProject) filters.projCode = this.selectedProject;

    this.prodReportService.getReport(filters).subscribe({      
      next: (resp) => {
        console.log(filters);        
        const data = (resp.data ?? []).map((p: any) => {
          const orders: OrderDetail[] = (p.orders ?? []).map((o: any) => {
            const cantidadRespaldo = Number(o.cantidadRespaldo ?? 0);
            const cantidadUtilizada = Number(o.cantidadUtilizada ?? 0);
            const saldo = cantidadRespaldo - cantidadUtilizada;
            return { ...o, cantidadRespaldo, cantidadUtilizada, saldo };
          });

          // Agrupamos por orden de compra
          const groupedOrders: OrderDetail[] = [];
          orders.forEach(o => {
            const existing = groupedOrders.find(go => go.orderCode === o.orderCode);
            if (existing) {
              existing.cantidadRespaldo += o.cantidadRespaldo;
              existing.cantidadUtilizada += o.cantidadUtilizada;
              existing.saldo += o.saldo;
            } else {
              groupedOrders.push({ ...o });
            }
          });

          // Totales del producto
          const totalRespaldado = groupedOrders.reduce((sum, o) => sum + o.cantidadRespaldo, 0);
          const totalUtilizada = groupedOrders.reduce((sum, o) => sum + o.cantidadUtilizada, 0);
          const saldo = totalRespaldado - totalUtilizada;

          return {
            prodCode: p.prodCode,
            prodDescr: p.prodDescr,
            totalRespaldado,
            totalUtilizada,
            saldo,
            orders: groupedOrders
          } as ProductReport;
        });

        this.products = data;
        this.page = resp.page ?? this.page;
        this.limit = resp.limit ?? this.limit;
        this.totalPages = resp.totalPages ?? Math.ceil((resp.total ?? 0) / this.limit);
        this.loading = false;
      },
      error: (err) => {
        console.error("Error cargando productos:", err);
        this.products = [];
        this.loading = false;
      }
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
