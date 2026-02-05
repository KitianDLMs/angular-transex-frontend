import { CommonModule, DatePipe } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrdrService } from '@shared/services/ordr.service';
import { AuthService } from '@auth/services/auth.service';
import { CustService } from '@dashboard/cust/services/cust.service';
import { Router } from '@angular/router';
import { ProjService } from '@shared/services/proj.service';
import { forkJoin, map } from 'rxjs';
import { ProgressCircleComponent } from '@shared/progress-circle/progress-circle.component';
import mapboxgl from 'mapbox-gl';
import { SeguimientoOverlayComponent } from 'src/app/seguimiento-sheet/seguimiento-sheet.component';
import { HoraPipe } from '@products/pipes/hora.pipe';

@Component({
  selector: 'app-ordr-page',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, ProgressCircleComponent, SeguimientoOverlayComponent, HoraPipe],
  templateUrl: './ordr-page.component.html',
})
export class OrdrPageComponent implements OnInit {

  map!: mapboxgl.Map;

  @ViewChild('map') mapEl!: ElementRef;

  ngAfterViewInit() {
    this.map = new mapboxgl.Map({
      container: this.mapEl.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-70.65, -33.45], // default
      zoom: 12
    });
  }

  orders: any[] = [];
  projectOptions: { proj_code: string; proj_name: string }[] = [];
  loading = false;
  page = 1;
  limit = 10;
  totalPages = 0;
  totalItems = 0;
  activeProject: string | null = null;
  currentUser: any = null;
  viewMode: 'ACTUALES' | 'FUTUROS' | null = null;
  selectedProject = '';
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
  showSeguimiento = false;
  ordenSeleccionada: any = null;

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
    } else {
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

        customerList.sort((a, b) =>
          a.name.toUpperCase().localeCompare(b.name.toUpperCase())
        );

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

  get sortedUserCustCodes(): string[] {
    return [...this.userCustCodes].sort((a, b) => {
      const nameA = (this.customersData[a]?.name || a).toUpperCase();
      const nameB = (this.customersData[b]?.name || b).toUpperCase();
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
        if (!this.userCustCode || !this.selectedProject) {
          this.orders = [];
          this.loading = false;
          return;
        }

        this.loading = true;

        let pedidos$;

        if (this.viewMode === 'FUTUROS') {      
          pedidos$ = this.ordrService.getFutureOrders(this.userCustCode, this.selectedProject);
        } else {      
          pedidos$ = this.ordrService.getPedidosPorProyecto(this.selectedProject, this.userCustCode);
        }
        
        pedidos$.subscribe({
          next: (pedidos: any[]) => {            
            const pedidosUnicos = new Map<string, any>();
            pedidos.forEach(o => {
              const code = o.order_code?.trim();
              if (!code) return;                  
          if (!pedidosUnicos.has(code)) {
            pedidosUnicos.set(code, {
              ...o,
              order_code: code,
              order_qty: Number(o.order_qty) || 0,
              detalles: [],        
              ejecutado: 0,
              porcentaje: 0,
            });
          }

          pedidosUnicos.get(code).detalles.push(o); 
        });
        const ordersArray = Array.from(pedidosUnicos.values());

        const avances$ = ordersArray.map(ord =>
          this.ordrService
            .getAvancePedido(ord.order_code, ord.order_Date)
            .pipe(
              map(av => ({
                ...ord,
                ejecutado: av.ejecutado || 0,
                porcentaje:
                  ord.order_qty > 0
                    ? Math.round((av.ejecutado / ord.order_qty) * 100)
                    : 0,
                descargaConfirmada: (av.ejecutado || 0) > 0
              }))
            )
        );

        forkJoin(avances$).subscribe({
          next: ordersConAvance => {
            this.orders = ordersConAvance;
            this.loading = false;
          },
          error: err => {
            console.error('Error obteniendo avance:', err);
            this.orders = ordersArray;
            this.loading = false;
          }
        });
      },
      error: () => {
        this.orders = [];
        this.loading = false;
      }
    });
  }

  onSelectProject() {
    this.page = 1;
    this.loadOrders();
  }

  selectViewMode(mode: 'ACTUALES' | 'FUTUROS') {
    this.viewMode = mode;
    this.page = 1;
    this.loadOrders(); 
  }

  private getOrderDateTime(ord: any): Date | null {
    if (!ord?.order_Date) return null;

    const dateParts = ord.order_Date.split('T')[0].split('-');
    const year = Number(dateParts[0]);
    const month = Number(dateParts[1]) - 1;
    const day = Number(dateParts[2]);

    let hh = 0, mm = 0;
    if (ord.start_time && ord.start_time.includes(':')) {
      const parts = ord.start_time.split(':').map(Number);
      if (!isNaN(parts[0]) && !isNaN(parts[1])) {
        hh = parts[0];
        mm = parts[1];
      }
    }

    return new Date(year, month, day, hh, mm, 0, 0);
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

  goToSeguimiento(ord: any, event: Event) {
    event.stopPropagation();
    this.ordenSeleccionada = ord;
    this.showSeguimiento = true;

    // opcional: centrar mapa
    this.map.flyTo({
      center: [ord.longitud, ord.latitud],
      zoom: 9
    });
  }

  get hasSelectedProject(): boolean {
    return !!this.selectedProject;
  }

  get filteredOrders(): any[] {
    if (this.viewMode === 'FUTUROS') {
      return this.orders;
    }

    const now = new Date();

    return this.orders.filter(ord => {
      const orderDateTime = this.getOrderDateTime(ord);
      if (!orderDateTime) return false;

      return orderDateTime.getTime() <= now.getTime();
    });
  }

  onOpenOrder(ord: any, event: Event) {
    event.stopPropagation();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orderDate = new Date(ord.order_Date);
    orderDate.setHours(0, 0, 0, 0);

    if (orderDate <= today) {
      this.router.navigate(
        ['/store-front/pedidos-actuales'],
        { queryParams: { code: ord.order_code, date: ord.order_Date } }
      );
    } else {
      this.router.navigate(
        ['/store-front/pedidos-futuros'],
        { queryParams: { code: ord.order_code, date: ord.order_Date } }
      );
    }
  }
}