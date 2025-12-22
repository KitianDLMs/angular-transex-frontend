import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TickService } from '@products/services/tick.service';
import { AuthService } from '@auth/services/auth.service';
import { CustService } from '@dashboard/cust/services/cust.service';
import { ProjService } from '@shared/services/proj.service';

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
  private projService = inject(ProjService);
  
  customerName = '';
  customerAddress = '';
  currentYear = new Date().getFullYear();
  today = new Date();
  userCustCode: string | null = null;
  selectAll: boolean = false;
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

    this.loadProjectsByCustomer();   // 👈 AQUI
    this.loadTicksByCustomer();
  }

  loadProjectsByCustomer(): void {
    if (!this.userCustCode) return;
    this.projService.getByCust(this.userCustCode).subscribe({
      next: (projects) => {
        console.log(projects);        
        this.projectOptions = projects.map(p => ({
          proj_code: p.proj_code,
          proj_name: p.proj_name,
        }));
      },
      error: (err) => {
        console.error('Error cargando obras:', err);
        this.projectOptions = [];
      }
    });
  }

  downloadExcel() {
    console.log('DESCARGAR EXCEL');    
  }
  
  downloadSelected() {
    const selectedCodes = this.results
      .filter(t => t.selected)
      .map(t => t.tkt_code);

    if (selectedCodes.length === 0) {
      alert('Debes seleccionar al menos un ticket');
      return;
    }

    this.tickService.downloadZip(selectedCodes).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Guias${Date.now()}.zip`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: err => {
        console.error('Error descarga ZIP:', err);
      }
    });
  }

  toggleAll() {
    this.results.forEach(t => t.selected = this.selectAll);
  }

  updateSelectAll() {
    this.selectAll = this.results.every(t => t.selected);
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

  this.page = 1;

  this.loading.set(true);

  const payload = {
    cust_code: this.userCustCode.trim(),

    proj_code: this.selectedProject || undefined,
    doc_type: this.filterDocType || undefined,
    tkt_code: this.filterDocNumber?.trim() || undefined,

    date_from: this.filterDateFrom
      ? `${this.filterDateFrom} 00:00:00`
      : undefined,

    date_to: this.filterDateTo
      ? `${this.filterDateTo} 23:59:59`
      : undefined,

    page: this.page,
    limit: this.limit,
  };

  console.log('🔎 Payload filtros:', payload);

  this.tickService.searchTicks(payload).subscribe({
    next: res => {
      this.results = res.data.map((r: any) => ({
        ...r,
        selected: false,
      }));
      this.totalPages = res.totalPages;
      this.totalItems = res.total;
      this.loading.set(false);
    },
    error: err => {
      console.error('ERROR SEARCH:', err);
      this.loading.set(false);
    },
  });
}

  downloadTicket(tkt_code: string) {
    if (!tkt_code) return;

    this.tickService.downloadTickPDF(tkt_code).subscribe({
      next: (blob: Blob) => {      
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${tkt_code}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
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