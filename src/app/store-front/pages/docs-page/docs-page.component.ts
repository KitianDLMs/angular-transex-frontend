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
  customerAddress = '';
  currentYear = new Date().getFullYear();
  today = new Date();
  userCustCode: string | null = null;
  selectAll: boolean = false;
  page = 1;
  limit = 10;
  totalPages = 0;
  totalItems = 0;
  loadingDownload = signal(false);

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
          if (!p.projcode || !p.projname) return;
          
          const code = p.projcode.trim();
          const name = p.projname.trim();

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
    if (!this.userCustCode) return;

    this.loading.set(true);

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
        this.loading.set(false);
      },
      error: err => {
        console.error("Error exportando Excel:", err);
        this.loading.set(false);
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

  // downloadSelected() {
  //   const selectedCodes = this.results
  //     .filter(t => t.selected)
  //     .map(t => t.tktCode?.trim())
  //     .filter(code => code);

  //   if (selectedCodes.length === 0) {
  //     alert('Debes seleccionar al menos un ticket');
  //     return;
  //   }

  //   this.loadingDownload.set(true);

  //   this.tickService.downloadZip(selectedCodes).subscribe({
  //     next: (response: any) => {
  //       const status = response.status;

  //       // 📌 Si es ZIP → descargar
  //       if (status === 200) {
  //         const blob = response.body;
  //         const url = window.URL.createObjectURL(blob);
  //         const a = document.createElement('a');
  //         a.href = url;
  //         a.download = `Guias${Date.now()}.zip`;
  //         a.click();
  //         window.URL.revokeObjectURL(url);
  //         this.loadingDownload.set(false);
  //         return;
  //       }

  //       // 📌 Si el backend dice que faltan
  //       if (status === 207) {
  //         const text = response.body;
  //         const reader = new FileReader();

  //         reader.onload = () => {
  //           const json = JSON.parse(reader.result as string);

  //           const missingList = json.missing.join(', ');

  //           const ok = confirm(
  //             `Las siguientes guías NO están disponibles:\n\n${missingList}\n\n¿Deseas descargar solo las que sí existen?`
  //           );

  //           if (!ok) {
  //             this.loadingDownload.set(false);
  //             return;
  //           }

  //           // Segunda llamada solo con las existentes
  //           this.tickService.downloadZip(json.existing).subscribe({
  //             next: (resp: any) => {
  //               const blob = resp.body;
  //               const url = window.URL.createObjectURL(blob);
  //               const a = document.createElement('a');
  //               a.href = url;
  //               a.download = `Guias${Date.now()}.zip`;
  //               a.click();
  //               window.URL.revokeObjectURL(url);
  //               this.loadingDownload.set(false);
  //             },
  //             error: () => {
  //               alert('Error al descargar las guías restantes.');
  //               this.loadingDownload.set(false);
  //             }
  //           });
  //         };

  //         reader.readAsText(text);
  //       }
  //     },

  //     error: (err) => {
  //       this.loadingDownload.set(false);
        
  //       if (err.status === 404) {
  //         const reader = new FileReader();
  //         reader.onload = () => {
  //           const json = JSON.parse(reader.result as string);
  //           alert(`No se encontró ninguna guía.\nFaltantes: ${json.missing.join(', ')}`);
  //         };
  //         reader.readAsText(err.error);
  //         return;
  //       }

  //       alert('Error al intentar descargar los documentos.');
  //     }
  //   });
  // }

downloadAll() {
  if (!this.userCustCode) return;

  this.loadingDownload.set(true); // 🔹 Inicia el loader

  const filters: any = { custCode: this.userCustCode.trim() };
  if (this.selectedProject?.trim()) filters.projCode = this.selectedProject.trim();
  if (this.filterDocNumber?.trim()) filters.docNumber = this.filterDocNumber.trim();
  if (this.filterDateFrom) filters.dateFrom = this.filterDateFrom;
  if (this.filterDateTo) filters.dateTo = this.filterDateTo;

  // Paso 1: pedir códigos y validar
  this.tickService.checkTktCodes(filters).subscribe({
    next: (res: any) => {
      const { existing, missing } = res;

      // 🔹 Si hay guías faltantes y el usuario cancela
      if (missing.length > 0) {
        const ok = confirm(`⚠️ Algunas guías NO están en la carpeta:\n${missing.join(', ')}\n\n¿Deseas continuar descargando las que sí existen?`);
        if (!ok) {
          this.loadingDownload.set(false); // 🔹 Aquí ocultamos el loader
          return;
        }
      }

      // 🔹 Si no hay guías disponibles
      if (existing.length === 0) {
        alert('No hay guías disponibles para descargar.');
        this.loadingDownload.set(false); // 🔹 Aquí también
        return;
      }

      // Paso 2: Descargar ZIP de guías existentes
      this.tickService.downloadZipByCodes(existing).subscribe({
        next: (response: any) => {
          const blob = response.body;
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Guias_${Date.now()}.zip`;
          a.click();
          window.URL.revokeObjectURL(url);

          // 🔹 Aquí revisamos headers, si quieres alert adicional
          const missingHeader = response.headers.get('X-Missing-Files');
          if (missingHeader) {
            const missingList = missingHeader.split(',').map((s: any) => s.trim()).join(', ');
            if (missingList) {
              alert(`⚠️ Algunas guías no se descargaron porque no existen:\n${missingList}`);
            }
          }

          this.loadingDownload.set(false); // 🔹 🔹 Aquí ocultamos el loader al terminar la descarga
        },
        error: (err) => {
          alert('Error descargando las guías.');
          this.loadingDownload.set(false); // 🔹 🔹 También ocultar loader si hay error
        }
      });

    },
    error: () => {
      alert('Error al obtener códigos de guías.');
      this.loadingDownload.set(false); // 🔹 Ocultar loader si falla el primer paso
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
        this.results = res.data.map((r: any) => {
          const prev = this.results.find(t => t.tktCode === r.tkt_code);
          return {
            ...r,
            selected: prev ? prev.selected : false,
          };
        });
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

    const cleanTktCode = tkt_code.trim();

    this.loadingDownload.set(true);

    this.tickService.downloadTickPDF(cleanTktCode).subscribe({
      next: (blob: Blob) => {      
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${cleanTktCode}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);

        this.loadingDownload.set(false);
      },
      error: (err) => {
        this.loadingDownload.set(false);
        if (err.status === 404) {        
          alert(`⚠️ La guía ${cleanTktCode} no se encuentra en la carpeta. No se puede descargar.`);
        } else {        
          console.error('Error descargando ticket:', err);
          alert('Ocurrió un error al intentar descargar la guía.');
        }
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