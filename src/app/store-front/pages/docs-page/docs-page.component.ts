import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TickService } from '@products/services/tick.service';
import { AuthService } from '@auth/services/auth.service';
import { CustService } from '@dashboard/cust/services/cust.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ProjService } from '@shared/services/proj.service';
import { forkJoin } from 'rxjs';

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
  currentYear = new Date().getFullYear();
  today = new Date();
  userCustCode: string | null = null;
  selectAll: boolean = false;
  page = 1;
  limit = 10;
  totalPages = 0;
  totalItems = 0;
  loadingDownload = signal(false);
  showDownloadFiltered = false;
  hasSearched = false;
  noResults = false;
  loading = false;
  results: any[] = [];
  filterDateFrom: any;  
  selectedTickets = new Set<string>();
  projectOptions: { proj_code: string; proj_name: string }[] = [];
  currentUser: any = null;
  filterWork: string = '';
  filterDocType: string = '';
  filterDateTo: string = '';
  userProjects: string[] = [];
  selectedProject: string = '';
  filterDocNumber: string | undefined;
  userCustCodes: string[] = []; 
  selectedCustCode: string | null = null;
  customersData: { [code: string]: { name: string, addr: string } } = {};
  selectedProjectName: string | null = null;
  customerAddress: string | null = null;

  get hasSelectedProject(): boolean {
    return !!this.selectedProject?.trim();
  }

  onCustomerChange() {
    if (!this.selectedCustCode) return;

    const data = this.customersData[this.selectedCustCode];
    if (data) {
      this.customerName = data.name;
      this.customerAddress = data.addr;
    }

    this.userCustCode = this.selectedCustCode;
    localStorage.removeItem('selectedSelection');
    this.selectedProject = '';
    this.selectedProjectName = null;
    this.loadProjectsByCustomer();
    // this.onSearch(true);
  }

  loadCustomerData(custCode: string) {
    this.userCustCode = custCode;

    this.selectedProject = '';
    this.selectedProjectName = null;

    const data = this.customersData[custCode];
    if (data) {
      this.customerName = data.name;
      this.customerAddress = data.addr;
    } else {
      this.loadCustomer();
    }

    this.loadProjects();
  }

  loadCustomer() {
    this.custService.getCustByCode(this.userCustCode!).subscribe(c => {
      this.customerName = c.name;
      this.customerAddress = c.addr_line_1 ?? null;
    });
  }

  loadProjects() {
    if (!this.userCustCode) return;

    const allowedProjects = this.currentUser?.projects ?? [];

    this.projService.getByCust(this.userCustCode).subscribe(projects => {

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

      // ==========================
      // 🔥 RESTAURAR DESDE STORAGE
      // ==========================

      const stored = localStorage.getItem('selectedSelection');

      if (!stored) {
        // this.loadProducts();
        return;
      }

      try {
        const parsed = JSON.parse(stored);
        const storedCust = parsed.custCode;
        const storedProj = parsed.projCode;

        // 🚨 Validar cliente
        if (storedCust !== this.userCustCode) {
          localStorage.removeItem('selectedSelection');
          // this.loadProducts();
          return;
        }

        // 🚨 Validar que el proyecto exista
        const exists = this.projectOptions.find(
          p => p.proj_code === storedProj
        );

        if (!exists) {
          localStorage.removeItem('selectedSelection');
          // this.loadProducts();
          return;
        }

        // ✅ Todo válido
        this.selectedProject = storedProj;
        this.resolveSelectedProjectName();

        // this.loadProducts();

      } catch (error) {
        console.error('Error parsing selectedSelection', error);
        localStorage.removeItem('selectedSelection');
        // this.loadProducts();
      }
    });
  }
  
  private resolveSelectedProjectName() {
    if (!this.selectedProject) {
      this.selectedProjectName = null;
      return;
    }

    const found = this.projectOptions.find(
      p => p.proj_code === this.selectedProject
    );

    this.selectedProjectName = found?.proj_name || this.selectedProject;
  }

  ngOnInit(): void {
    const user = this.authService.user();
    if (!user) return;
    this.userCustCodes = user?.cust_codes || [];
    if (this.userCustCodes.length === 0) {      
      const singleCustCode = user?.cust_code || null;
      if (singleCustCode) this.userCustCodes = [singleCustCode];
    }    
    const stored = localStorage.getItem('selectedSelection');

    if (stored) {
      const parsed = JSON.parse(stored);
      this.userCustCode = parsed.custCode;
      this.selectedCustCode = parsed.custCode;
      this.selectedProject = parsed.projCode;
      this.resolveSelectedProjectName();
    } else {
      this.selectedCustCode = this.userCustCodes[0] || null;
      this.userCustCode = this.selectedCustCode;
    }

    if (!this.selectedCustCode) return;
    if (this.userCustCodes.length === 1) {      
      this.custService.getCustByCode(this.selectedCustCode).subscribe(cust => {
        this.customersData[this.selectedCustCode!] = {
          name: cust.name ?? 'Sin nombre',
          addr: cust.addr_line_1 ?? 'Sin dirección'
        };
        this.customerName = cust.name ?? 'Sin nombre';
        this.customerAddress = cust.addr_line_1 ?? 'Sin dirección';
        this.loadProjectsByCustomer();
        // this.onSearch(true);
      });
    } else {      
      forkJoin(this.userCustCodes.map(code => this.custService.getCustByCode(code)))
        .subscribe(results => {
          const customers = results.map((cust, i) => {
            const code = this.userCustCodes[i];
            const name = cust.name || 'Sin nombre';
            this.customersData[code] = {
              name,
              addr: cust.addr_line_1 || 'Sin dirección'
            };
            return { code, name };
          });
          customers.sort((a, b) =>
            a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
          );

          this.userCustCodes = customers.map(c => c.code);

          // 🔥 RESPETAR STORAGE
          if (this.selectedCustCode && this.userCustCodes.includes(this.selectedCustCode)) {
            this.userCustCode = this.selectedCustCode;
          } else {
            this.selectedCustCode = this.userCustCodes[0];
            this.userCustCode = this.selectedCustCode;
          }

          const data = this.customersData[this.selectedCustCode!];
          this.customerName = data.name;
          this.customerAddress = data.addr;
          this.loadProjectsByCustomer();
          // this.onSearch(true);
        });
    }
  }

  onDocNumberInput(value: string) {
    this.filterDocNumber = value.replace(/[^0-9]/g, '').slice(0, 10);
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const key = event.key;

    if (event.ctrlKey || event.metaKey) {
      return;
    }

    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (allowedKeys.includes(key)) {
      return;
    }

    if (!/^[0-9]$/.test(key)) {
      event.preventDefault();
    }
  }

  loadProjectsByCustomer(): void {
    if (!this.userCustCode) return;

    const user = this.authService.user();
    const allowedProjects = user?.projects || [];

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
        const stored = localStorage.getItem('selectedSelection');

          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              if (parsed.custCode !== this.userCustCode) {
                localStorage.removeItem('selectedSelection');
                this.selectedProject = '';
                this.selectedProjectName = null;
                return;
              }
              const exists = this.projectOptions.find(
                p => p.proj_code === parsed.projCode
              );
              if (!exists) {
                localStorage.removeItem('selectedSelection');
                this.selectedProject = '';
                this.selectedProjectName = null;
                return;
              }
              this.selectedProject = parsed.projCode;
              this.resolveSelectedProjectName();
            } catch {
              localStorage.removeItem('selectedSelection');
              this.selectedProject = '';
              this.selectedProjectName = null;
            }
          }     
        },
      error: err => {
        console.error('Error cargando obras:', err);
        this.projectOptions = [];
      }
    });
  }

  downloadExcel() {
    if (!this.userCustCode) return;
    this.loading = true;
    const filters: any = {
      custCode: this.userCustCode.trim(),
    };
    if (this.selectedProject?.trim()) filters.projCode = this.selectedProject.trim();
    if (this.filterDocNumber?.trim()) filters.docNumber = this.filterDocNumber.trim();
    if (this.filterDateFrom) filters.dateFrom = this.filterDateFrom;
    if (this.filterDateTo) filters.dateTo = this.filterDateTo;    
    this.tickService.getAllForExcel(filters).subscribe({
      next: (data: any[]) => {
        const formatted = data;
        this.generateExcel(formatted);
        this.loading = false;
      },
      error: err => {
        console.error("Error exportando Excel:", err);
        this.loading = false;
      }
    });
  }

  private generateExcel(data: any[]) {
    if (!data.length) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Documentos');
    const headerCells = Object.keys(data[0]).map((_, i) =>
      XLSX.utils.encode_cell({ r: 0, c: i })
    );
    headerCells.forEach(cell => {
      if (!worksheet[cell]) return;
      worksheet[cell].s = {
        font: { bold: true },
        alignment: { horizontal: 'center' },
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
    saveAs(blob, `documentos_completos_${Date.now()}.xlsx`);
  }

  downloadAllFiltered() {
    if (!this.userCustCode) {
      return;
    }
    const filters: any = {
      custCode: this.userCustCode.trim(),
    };
    if (this.selectedProject?.trim()) {
      filters.projCode = this.selectedProject.trim();
    }
    if (this.filterDocNumber?.trim()) {
      filters.docNumber = this.filterDocNumber.trim();
    }
    if (this.filterDateFrom) {
      filters.dateFrom = this.filterDateFrom;
    }
    if (this.filterDateTo) {
      filters.dateTo = this.filterDateTo;
    }
    this.loadingDownload.set(true);
    this.tickService
      .downloadAllFiltered(filters)
      .subscribe({
        next: (res:any)=>{
          this.descargarBlob(
            res.body!,
            `Guias_${Date.now()}.zip`
          );
          this.loadingDownload.set(false);
        },
        error:(err)=>{
          this.loadingDownload.set(false);
          if (err.status === 404) {
            alert(
              '⚠️ No hay guías disponibles para descargar en la carpeta.'
            );
            return;
          }
          console.error(err);
          alert(
            'Ocurrió un error al intentar descargar los documentos.'
          );
        }
      });
  }
  
  downloadSelected() {
    const selectedCodes =
      Array.from(this.selectedTickets);
    if (!selectedCodes.length) {
      alert(
        'Debes seleccionar al menos una guía.'
      );
      return;
    }
    this.loadingDownload.set(true);
    this.tickService
      .downloadZipByCodes(selectedCodes)
      .subscribe({
        next:(res:any)=>{
          this.descargarBlob(
            res.body!,
            `Guias_${Date.now()}.zip`
          );
          this.loadingDownload.set(false);
        },
        error:(err)=>{
          this.loadingDownload.set(false);
          if(err.status === 404){
            const reader =
              new FileReader();
            reader.onload=()=>{
              const data =
                JSON.parse(
                  reader.result as string
                );
              alert(
                `No se encontraron PDFs.\nGuias faltantes: ${data.missing.join(', ')}`
              );
            };
            reader.readAsText(err.error);
            return;
          }
          console.error(err);
          alert(
            'Error descargando guías'
          );
        }
      });
  }

  private descargarTxt(guias:string[]) {
    const contenido =
      [
        'GUIAS NO ENCONTRADAS',
        '====================',
        '',
        ...guias
      ].join('\n');
    const blob =
      new Blob(
        [contenido],
        {
          type:'text/plain;charset=utf-8'
        }
      );
    const url =
      window.URL.createObjectURL(blob);
    const a =
      document.createElement('a');
    a.href=url;
    a.download =
      `guias_no_encontradas_${Date.now()}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
  
  private descargarBlob(blob: Blob, nombreArchivo: string = 'documentos.zip') {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  toggleAll() {
    this.results.forEach(ticket => {
      ticket.selected = this.selectAll;
      const code = String(ticket.tkt_code).trim();
      if (!code) return;
      if (this.selectAll) {
        this.selectedTickets.add(code);
      } else {
        this.selectedTickets.delete(code);
      }
    });
  }

  updateTicketSelection(ticket: any) {
    const code = String(ticket.tkt_code).trim();
    if (!code) return;
    if (ticket.selected) {
      this.selectedTickets.add(code);
    } else {
      this.selectedTickets.delete(code);
    }

    this.selectAll =
      this.results.length > 0 &&
      this.results.every(t => t.selected);
  }

  clearFilter() {
    this.selectedProject = '';
    this.selectedProjectName = null;
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
    if (this.selectedProject && this.userCustCode) {
      localStorage.setItem('selectedSelection', JSON.stringify({
        custCode: this.userCustCode,
        projCode: this.selectedProject
      }));
    }
    this.resolveSelectedProjectName();
    // this.onSearch(true);
  }

  onSearch(resetPage: boolean = false) {
    this.hasSearched = true;
    if (!this.userCustCode) {
      return;
    }
    if (resetPage) {
      this.page = 1;
    }
    this.loading = true;
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
    
    this.tickService.searchTicks(params).subscribe({
    next: (res: any) => {                
        this.results = (res.data ?? [])
        .sort((a: any, b: any) => {
          return new Date(b.order_date).getTime() - new Date(a.order_date).getTime();
        })
        .map((ticket: any) => ({
          ...ticket,
          selected: this.selectedTickets.has(String(ticket.tkt_code).trim())
        }));
        this.noResults = this.results.length === 0;
        this.showDownloadFiltered = this.results.length > 0;
        this.selectAll =
          this.results.length > 0 &&
          this.results.every(t => t.selected);
        this.totalItems = res.total ?? 0;
        this.totalPages = res.totalPages ?? 1;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.results = [];
        this.noResults = true;
        this.loading = false;
      }
    });
  }

  getProjectName(code: string): string {
    const proj = this.projectOptions.find(
      p => p.proj_code === code?.trim(),      
    );    
    return proj?.proj_name || code;
  }

  hasActiveFilters(): boolean {
    return !!(
      this.filterDocNumber?.trim() ||
      this.filterDateFrom ||
      this.filterDateTo ||
      this.filterDocType
    );
  }

  get canSearch(): boolean {
    const hasDocNumber = !!this.filterDocNumber?.trim();
    const hasBothDates =
      !!this.filterDateFrom &&
      !!this.filterDateTo;
    return hasDocNumber || hasBothDates;
  }

  downloadTicket(tkt_code: string) {
    if (!tkt_code) return;    
    this.loadingDownload.set(true);
    this.tickService.downloadTickPDF(tkt_code).subscribe({
      next: (blob: Blob) => {      
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${tkt_code}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.loadingDownload.set(false);
      },
      error: (err) => {
        this.loadingDownload.set(false);
        if (err.status === 404) {        
          alert(`⚠️ La guía ${tkt_code} no se encuentra en la carpeta. No se puede descargar.`);
        } else {        
          console.error('Error descargando ticket:', err);
          alert('Ocurrió un error al intentar descargar la guía.');
        }
      }
    });
  }

  handleClearFilters() {    
    this.filterDocType = "";
    this.filterDocNumber = "";
    this.filterDateFrom = null;
    this.filterDateTo = "";
    this.results = [];
    this.showDownloadFiltered = false;
    this.noResults = false;
    // this.onSearch(true);
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