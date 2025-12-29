import { CommonModule, DatePipe } from '@angular/common';
import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrdrService } from '@shared/services/ordr.service';
import { AuthService } from '@auth/services/auth.service';
import { CustService } from '@dashboard/cust/services/cust.service';
import { Router } from '@angular/router';
import { ProjService } from '@shared/services/proj.service';

@Component({
  selector: 'app-ordr-page',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './ordr-page.component.html',
})
export class OrdrPageComponent {

  orders: any[] = [];

  projectOptions: { proj_code: string; proj_descr: string }[] = [];
  selectedProject: string = '';

  loading = signal(true);

  page = 1;
  limit = 10;
  totalPages = 0;
  totalItems = 0;

  today = new Date();
  currentYear = new Date().getFullYear();

  customerName: string | null = null;
  customerAddress: string | null = null;

  userCustCode: string | null = null;
  userName: string | null = null;

  authService = inject(AuthService);
  custService = inject(CustService);
  projService = inject(ProjService);

  constructor(
    private ordrService: OrdrService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.user();

    this.userName = user?.fullName || 'Usuario';
    this.userCustCode = user?.cust_code || null;

    if (!this.userCustCode) return;

    this.custService.getCustByCode(this.userCustCode).subscribe(cust => {
      this.customerName = cust.name;
      this.customerAddress = cust.addr_line_1 ?? null;
    });

    this.loadProjects();
    this.loadOrders();  
  }

  loadProjects() {
    if (!this.userCustCode) return;

    this.projService.getByCust(this.userCustCode).subscribe({
      next: (res) => {
        const map = new Map<string, { proj_code: string; proj_descr: string }>();

        res.forEach((p: any) => {
          if (!p.proj_code || !p.proj_descr) return;

          const code = p.proj_code.trim();
          const descr = p.proj_descr.trim();

          if (!map.has(code)) {
            map.set(code, {
              proj_code: code,
              proj_descr: descr,
            });
          }
          else if (descr.length > map.get(code)!.proj_descr.length) {
            map.set(code, {
              proj_code: code,
              proj_descr: descr,
            });
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

  loadOrders() {
    if (!this.userCustCode) return;

    this.loading.set(true);

    this.ordrService
      .getOrdersByCustomerPaginated(
        this.userCustCode,
        this.selectedProject,
        this.page,
        this.limit
      )
      .subscribe({
        next: (res: any) => {                        
          this.orders = res.data;
          this.totalPages = res.totalPages;
          this.totalItems = res.total;
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  onSelectProject() {
    this.page = 1;
    this.loadOrders();
  }

  clearFilter() {
    this.selectedProject = '';
    this.page = 1;
    this.loadOrders();
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadOrders();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadOrders();
    }
  }

  goToSeguimiento(ord: any) {
    this.router.navigate(
      ['/store-front/seguimiento'],
      { queryParams: { code: ord.order_code } }
    );
  }
}
