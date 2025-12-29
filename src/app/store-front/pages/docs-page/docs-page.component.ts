import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TickService } from '@products/services/tick.service';
import { AuthService } from '@auth/services/auth.service';
import { CustService } from '@dashboard/cust/services/cust.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { OrdrService } from '@shared/services/ordr.service';
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
  limit = 10;
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

    this.loadProjectsByCustomer();
    this.onSearch(true);
  }

  loadProjectsByCustomer(): void {
    if (!this.userCustCode) return;

    this.projService.getByCust(this.userCustCode).subscribe({
      next: (projects) => {
        const map = new Map<string, { proj_code: string; proj_name: string }>();

        projects.forEach(p => {
          if (!p.proj_code || !p.proj_descr) return;

          const code = p.proj_code.trim();
          const name = p.proj_descr.trim();

          if (!map.has(code)) {
            map.set(code, {
              proj_code: code,
              proj_name: name,
            });
          }
          else if (name.length > map.get(code)!.proj_name.length) {
            map.set(code, {
              proj_code: code,
              proj_name: name,
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


  downloadExcel() {
    const data = this.results.map(tick => ({
      Fecha: new Date(tick.order_date).toLocaleDateString('es-CL'),
      Guía: tick.tkt_code,
      Pedido: tick.order_code,
      Proyecto: tick.proj_code?.trim(),
      Obra: tick.proj_name?.trim() ?? tick.proj_code?.trim(),
      Hormigón: tick.product?.prod_descr,
      Cantidad: tick.total_qty,
      'Precio Total': tick.total_price,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Documentos');
    
    const headerCells = Object.keys(data[0]).map((_, i) =>
      XLSX.utils.encode_cell({ r: 0, c: i })
    );

    headerCells.forEach(cell => {
      if (!worksheet[cell]) return;

      worksheet[cell].s = {
        fill: {
          fgColor: { rgb: 'E5E7EB' },
        },
        font: {
          bold: true,
          color: { rgb: '000000' },
        },
        alignment: {
          horizontal: 'center',
          vertical: 'center',
        },
        border: {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' },
        },
      };
    });

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      cellStyles: true,
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(blob, `documentos_${Date.now()}.xlsx`);
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

  clearFilter() {
    this.selectedProject = '';
    this.filterWork = '';
    this.filterDocNumber = '';
    this.filterDocType = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.onSearch(true);
  }

  isService(tick: any): boolean {
    return tick?.prod_descr?.toUpperCase() === 'SERVICIO BOMBEO';
  }

  onSelectProject() {
    this.onSearch(true);
  }

  onSearch(resetPage: boolean = false) {
    if (!this.userCustCode) return;

    if (resetPage) this.page = 1;

    this.loading.set(true);
    console.log(this.userCustCode);
    
    const params: any = {
      custCode: this.userCustCode.trim(),
      page: this.page,
      limit: this.limit,
    };
    
    if (this.selectedProject?.trim()) {
      params.projCode = this.selectedProject.trim();
    }

    if (this.filterDocNumber?.trim()) {
      params.docNumber = this.filterDocNumber.trim();
    }

    if (this.filterDateFrom) {
      params.dateFrom = this.filterDateFrom;
    }
    if (this.filterDateTo) {
      params.dateTo = this.filterDateTo;
    }

    params.page = this.page.toString();
    params.limit = this.limit.toString();    
    this.tickService.searchTicks(params).subscribe({
      next: res => {        
        console.log(res);        
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

  getProjectName(code: string): string {
    const proj = this.projectOptions.find(
      p => p.proj_code === code?.trim(),      
    );    
    return proj?.proj_name || code;
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

  handleClearFilters() {
    this.selectedProject = "";
    this.filterDocType = "";
    this.filterDocNumber = "";
    this.filterDateFrom = null;
    this.filterDateTo = "";
    this.results = [];
    this.onSearch(true);
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.onSearch();
    }
  }

  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.onSearch();
    }
  }
}