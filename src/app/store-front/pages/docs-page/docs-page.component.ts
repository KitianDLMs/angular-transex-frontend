import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TickService } from '@products/services/tick.service';
import { AuthService } from '@auth/services/auth.service';
import { CustService } from '@dashboard/cust/services/cust.service';

@Component({
  selector: 'app-docs-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './docs-page.component.html',
})
export class DocsPageComponent implements OnInit {

  private tickService = inject(TickService);
  private authService = inject(AuthService);
  private custService = inject(CustService);

  customerName = '';
  customerAddress = '';
  currentYear = new Date().getFullYear();
  today = new Date();
  userCustCode: string | null = null;

  page = 1;
  limit = 20;
  totalPages = 0;
  totalItems = 0;

  loading = signal(false);
  results: any[] = [];
  filterDateFrom: any;

  projectOptions: { proj_code: string; proj_name: string }[] = [];

  filterWork: string = '';
  filterDocType: string = '';
  filterDocNumber: string = '';
  filterDateTo: string = '';

  selectedProject: string = '';

  ngOnInit(): void {
    const user = this.authService.user();
    this.userCustCode = user?.cust_code ?? null;

    if (!this.userCustCode) {
      return;
    }


    this.custService.getCustByCode(this.userCustCode).subscribe(cust => {
      this.customerName = cust.name ?? 'Sin nombre';
      this.customerAddress = cust.addr_line_1 ?? 'Sin dirección';
    });
    
    this.loadTicksByCustomer();
  }

  loadTicksByCustomer(): void {
    if (!this.userCustCode) return;

    this.loading.set(true);

    this.tickService
      .getTicksByCustomer(this.userCustCode, this.page, this.limit)
      .subscribe({
        next: res => {
          this.results = res.data;
          this.totalPages = res.totalPages;
          this.loading.set(false);
        },
        error: err => {
          console.error('ERROR API:', err);
          this.loading.set(false);
        }
      });
  }

  clearFilter() {
    this.selectedProject = '';
    this.filterWork = '';
    this.filterDocNumber = '';
    this.filterDocType = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.onSearch();
  }

  onSelectProject() {
    console.log("Proyecto seleccionado:", this.selectedProject);
    this.onSearch();
  }

  onSearch() {
    if (!this.userCustCode) return;

    this.loading.set(true);

    this.tickService
      .getTicksByCustomer(this.userCustCode, this.page, this.limit)
      .subscribe({
        next: (res: any) => {
          this.results = res.data;
          this.totalPages = res.totalPages;
          this.totalItems = res.total;
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
  }

  downloadTicket(tkt_code: string) {
    if (!tkt_code) return;

    this.tickService.downloadTickPDF(tkt_code).subscribe({
      next: (blob: Blob) => {
        // Crear URL temporal para descargar el archivo
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${tkt_code}.pdf`; // nombre del archivo
        link.click();
        window.URL.revokeObjectURL(url); // limpiar memoria
      },
      error: (err) => {
        console.error('Error descargando ticket:', err);
      }
    });
  }


  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.onSearch();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.onSearch();
    }
  }

  handleClearFilters() {
    this.selectedProject = "";
    this.filterDocType = "";
    this.filterDocNumber = "";
    this.filterDateFrom = "";
    this.filterDateTo = "";
    this.results = [];
    console.log("Filtros limpiados");
  }
}