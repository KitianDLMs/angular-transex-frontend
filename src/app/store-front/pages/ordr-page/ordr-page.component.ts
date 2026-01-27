import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrdrService } from '@shared/services/ordr.service';
import { AuthService } from '@auth/services/auth.service';
import { CustService } from '@dashboard/cust/services/cust.service';
import { Router } from '@angular/router';
import { ProjService } from '@shared/services/proj.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-ordr-page',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './ordr-page.component.html',
})
export class OrdrPageComponent implements OnInit {

  orders: any[] = [];
  projectOptions: { proj_code: string; proj_name: string }[] = [];
  selectedProject = '';

  loading = false;

  page = 1;
  limit = 10;
  totalPages = 0;
  totalItems = 0;
  activeProject: string | null = null;

  currentUser: any = null;
  viewMode: 'ACTUALES' | 'FUTUROS' = 'ACTUALES';

  today = new Date();
  currentYear = new Date().getFullYear();

  customerName: string | null = null;
  customerAddress: string | null = null;

  userCustCode: string | null = null;
  userName: string | null = null;
  expandedOrderCode: string | null = null;
  userCustCodes: string[] = [];
  selectedCustCode: string | null = null;
  customersData: { [code: string]: { name: string; addr_line_1: string } } = {};  

  authService = inject(AuthService);
  custService = inject(CustService);
  projService = inject(ProjService);

  constructor(
    private ordrService: OrdrService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.user();
    if (!this.currentUser) return;
    this.userCustCodes = this.currentUser.cust_codes || [];
    if (this.userCustCodes.length <= 1) {
      this.selectedCustCode = this.userCustCodes[0] || this.currentUser.cust_code;
      this.userCustCode = this.selectedCustCode;
      if (this.userCustCode) {
        this.custService.getCustByCode(this.userCustCode).subscribe(cust => {
          this.customerName = cust.name;
          this.customerAddress = cust.addr_line_1 ?? null;
          this.loadProjects();
          this.loadOrders();
        });
      }
    } 
    else {
      const observables = this.userCustCodes.map(code =>
    this.custService.getCustByCode(code)
  );

    forkJoin(observables).subscribe(customers => {
        const customerList = customers.map((cust, i) => {
          const code = (this.userCustCodes[i] || '').trim();
          return {
            code,
            name: cust.name || 'Sin nombre',
            addr_line_1: cust.addr_line_1 || 'Sin dirección'
          };
        });
        customerList.sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase()));
        
        this.userCustCodes = customerList.map(c => c.code);
        customerList.forEach(c => {
          this.customersData[c.code] = {
            name: c.name,
            addr_line_1: c.addr_line_1
          };
        });
        this.selectedCustCode = (this.userCustCodes[0] || '').trim();
        this.loadCustomerData(this.selectedCustCode);
      });


    }
  }

  toggleOrder(orderCode: string) {
    this.expandedOrderCode =
      this.expandedOrderCode === orderCode ? null : orderCode;
  }

  get sortedUserCustCodes(): string[] {
    return [...this.userCustCodes].sort((a, b) => {      
      const nameA = (this.customersData[a]?.name || a).toUpperCase();
      const nameB = (this.customersData[b]?.name || b).toUpperCase();
      console.log(nameA);
      console.log(nameB);
      return nameA.localeCompare(nameB);
    });
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
      this.customerAddress = data.addr_line_1 ?? null;
    } else {      
      this.loadCustomer(custCode);
    }
    
    this.loadProjects();
    this.loadOrders();
  }

  loadCustomer(custCode: string) {
    this.custService.getCustByCode(custCode).subscribe(cust => {
      this.customerName = cust.name;
      this.customerAddress = cust.addr_line_1 ?? null;
      
      this.customersData[custCode] = {
        name: cust.name || 'Sin nombre',
        addr_line_1: cust.addr_line_1 || 'Sin dirección'
      };
    });
  }

  get filteredOrders(): any[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.orders.filter(ord => {
      const orderDate = new Date(ord.order_Date);
      orderDate.setHours(0, 0, 0, 0);

      return this.viewMode === 'ACTUALES'
        ? orderDate <= today
        : orderDate > today;
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

      if (this.projectOptions.length) {
        this.activeProject = this.projectOptions[0].proj_code;
        this.loadOrders();
      }
    });
  }

  loadOrders() {
    if (!this.userCustCode) return;

    this.loading = true;

    const proyectos = this.selectedProject ? [this.selectedProject] : this.projectOptions.map(p => p.proj_code);
    console.log(proyectos);    
    
    if (!proyectos.length) {
      this.orders = [];
      this.loading = false;
      return;
    }
    const requests = proyectos.map(proj =>
      this.ordrService.getPedidosPorProyecto(proj, this.userCustCode!)
    );

    forkJoin(requests).subscribe({
      next: (responses: any) => {        
        this.orders = responses.flat();
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.orders = [];
        this.loading = false;
      },
    });
  }

  onSelectProject() {
    this.page = 1;

    this.activeProject = this.selectedProject || null;

    if (this.activeProject) {
      this.loadOrders();
    } else {
      this.orders = [];
    }
  }

  clearFilter() {
    this.selectedProject = '';

    if (this.projectOptions.length) {
      this.activeProject = this.projectOptions[0].proj_code;
      this.page = 1;
      this.loadOrders();
    } else {
      this.orders = [];
    }
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

  get hasOrders(): boolean {
    return !this.loading && this.orders.length === 0;
  }

  verPedidosActuales(ord: any, event: Event) {
    event.stopPropagation();
    this.router.navigate(
      ['/store-front/pedidos-actuales'],
      { queryParams: { code: ord.order_code, mode: 'actuales' } }
    );
  }

  verPedidosFuturos(ord: any, event: Event) {
   event.stopPropagation();
    this.router.navigate(
      ['/store-front/pedidos-futuros'],
      { queryParams: { code: ord.order_code, mode: 'futuros' } }
    );
  }
}
