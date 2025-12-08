import { CommonModule, DatePipe } from '@angular/common';
import { Component, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OrdrService } from '@shared/services/ordr.service';
import { AuthService } from '@auth/services/auth.service';
import { ProjService } from '@shared/services/proj.service';
import { ProdService } from '@shared/services/prod.service';

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

  today = new Date();
  currentYear = new Date().getFullYear();

  authService = inject(AuthService);
  projService = inject(ProjService);
  prodService = inject(ProdService);
    
  filteredCustCode = signal('');

  projectOptions: any[] = [];

  // 👉 NUEVO: datos del usuario para el tooltip
  userName: string | null = null;
  userCustCode: string | null = null;

  constructor(
    private ordrService: OrdrService,    
  ) {}

  ngOnInit() {
    const user = this.authService.user();

    this.userName = user?.fullName || 'Usuario';
    this.userCustCode = user?.cust_code || null;

    this.filteredCustCode.set(this.userCustCode?.trim() || '');

    if (this.userCustCode) {
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

  loadOrders() {
    this.ordrService.getOrders(this.userCustCode!, this.selectedProject)
      .subscribe((data: any) => {
        console.log(data);        
        this.orders = data;
      });
  }

  onFilterCustCode(value: string) {
    this.filteredCustCode.set(value.trim());
    this.loadOrders();
  }

  onSelectProject() {
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
}
