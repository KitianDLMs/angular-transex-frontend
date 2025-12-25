import { CommonModule, DatePipe } from '@angular/common';
import { Component, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrdrService } from '@shared/services/ordr.service';
import { AuthService } from '@auth/services/auth.service';
import { ProjService } from '@shared/services/proj.service';
import { ProdService } from '@shared/services/prod.service';
import { CustService } from '@dashboard/cust/services/cust.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ordr-page',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './ordr-page.component.html',
})
export class OrdrPageComponent {
  orders: any[] = [];
  custCode: string = '';
  selectedProject: string = '';
  loading = signal(true);

  page = 1;
  limit = 10;
  totalPages = 0;
  totalItems = 0;

  expandedOrder: string | null = null;
  orderLines: any[] = [];

  today = new Date();
  currentYear = new Date().getFullYear();

  customerName: string | null = null;
  customerAddress: string | null = null;

  authService = inject(AuthService);
  projService = inject(ProjService);
  prodService = inject(ProdService);
  custService = inject(CustService);  
    
  filteredCustCode = signal('');
  projectOptions: any[] = [];
  userName: string | null = null;
  userCustCode: string | null = null;
  groupedOrders: any[] = [];

  constructor(
    private ordrService: OrdrService,    
    private router: Router,
  ) {}

  ngOnInit() {
    const user = this.authService.user();

    this.userName = user?.fullName || 'Usuario';
    this.userCustCode = user?.cust_code || null;

    this.filteredCustCode.set(this.userCustCode?.trim() || '');

    if (this.userCustCode) {
      this.custService.getCustByCode(this.userCustCode).subscribe(cust => {
        this.customerName = cust.name || 'Sin nombre';
        this.customerAddress = cust.addr_line_1 || 'Sin dirección';
      });
      this.projService.getByCustomer(this.userCustCode.trim()).subscribe({
        next: res => this.projectOptions = res,
        error: err => console.error(err)
      });
    }

    this.loadOrders();
  }

  searchOrders() {
    const code = this.custCode.trim();
    if (!code) return;

    this.ordrService.getOrdersByCustCode(code)
      .subscribe(data => this.orders = data);
  }

  groupOrders() {
    const map = new Map<string, any>();
    for (const o of this.orders) {
      if (!map.has(o.order_code)) {
        map.set(o.order_code, {
          order_code: o.order_code,
          order_date: o.order_date,
          status: o.status,
          totalQuantity: 0,
        });
      }
      map.get(o.order_code).totalQuantity += Number(o.quantity);
    }
    this.groupedOrders = Array.from(map.values());
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
          this.groupOrders();        
          this.totalPages = res.totalPages;
          this.totalItems = res.total;
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
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


  // loadData() {
  //   this.service.getAll().subscribe(data => {
  //     this.items = data;
  //   });
  // }

  trackByProj(index: number, item: any) {
    // this.loadOrders();
    return item.proj_code;
  }


  onFilterCustCode(value: string) {
    this.filteredCustCode.set(value.trim());
    this.loadOrders();
  }

  onSelectProject() {
    console.log("Proyecto seleccionado:", this.selectedProject);
    this.loadOrders();
  }

  clearFilter() {
    this.selectedProject = '';
    this.loadOrders();
  }

  loadProductsByCustomer() {
    if (!this.userCustCode) return;

    this.prodService.getByCustomer(this.userCustCode).subscribe(res => {
      // this.imstResource.set(res);
    });
  }

  goToSeguimiento(ord: any) {
    this.router.navigate(
      ['/store-front/seguimiento'],
      { queryParams: { code: ord.order_code } }
    );
  }


}
