import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TickService } from '@products/services/tick.service';
import { AuthService } from '@auth/services/auth.service';
import { CustService } from '@dashboard/cust/services/cust.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
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
  customerAddress: string | null = null;
  currentYear = new Date().getFullYear();
  today = new Date();
  userCustCode: string | null = null;
  selectedCustCode: string | null = null;
  userCustCodes: string[] = [];
  customersData: {
    [code: string]: {
      name: string;
      addr: string;
    }
  } = {};

  currentUser: any = null;
  projectOptions: {
    proj_code: string;
    proj_name: string;
  }[] = [];
  selectedProject = '';
  selectedProjectName: string | null = null;
  userProjects: string[] = [];
  filterWork = '';
  filterDocType = '';
  filterDateFrom: any;
  filterDateTo = '';
  filterDocNumber: string | undefined;
  page = 1;
  limit = 10;
  totalPages = 0;
  totalItems = 0;
  loading = false;
  loadingDownload = signal(false);
  results: any[] = [];
  hasSearched = false;
  noResults = false;
  showDownloadFiltered = false;
  selectAll = false;
  selectedTickets = new Set<string>();

  get hasSelectedProject(): boolean {
    return !!this.selectedProject?.trim();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.user();
    if (!this.currentUser) {      
      return;
    }
    this.userCustCodes = this.currentUser.cust_codes || [];
    if (this.userCustCodes.length === 0) {
      const singleCustCode =
        this.currentUser.cust_code || null;
      if (singleCustCode) {
        this.userCustCodes = [singleCustCode];
      }
    }
    this.userProjects =
      (this.currentUser.projects || [])
        .map((p: any) =>
          String(
            typeof p === 'string'
              ? p
              : p.proj_code
          ).trim()
        );
    const stored =
      localStorage.getItem('selectedSelection');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);    
        this.selectedCustCode =
          parsed.custCode
            ? String(parsed.custCode).trim()
            : null;
        this.selectedProject =
          parsed.projCode
            ? String(parsed.projCode).trim()
            : '';
        this.userCustCode =
          this.selectedCustCode;
      } catch (error) {
        localStorage.removeItem(
          'selectedSelection'
        );
      }
    }

    if (!this.selectedCustCode) {
      this.selectedCustCode =
        this.userCustCodes[0] || null;
      this.userCustCode =
        this.selectedCustCode;
    }

    if (!this.selectedCustCode) {
      return;
    }

    this.loadCustomerData(
      this.selectedCustCode
    );
  }

  loadCustomerData(custCode: string): void {
    if (!custCode) return;
    this.userCustCode = custCode;
    this.selectedCustCode = custCode;
    const data =
      this.customersData[custCode];
    if (data) {
      this.customerName = data.name;
      this.customerAddress = data.addr;
      this.loadProjectsByCustomer();
    } else {
      this.custService
        .getCustByCode(custCode)
        .subscribe({
          next: cust => {
            this.customersData[custCode] = {
              name:
                cust.name ||
                'Sin nombre',
              addr:
                cust.addr_line_1 ||
                'Sin dirección'
            };
            this.customerName =
            this.customersData[custCode].name;
            this.customerAddress =
            this.customersData[custCode].addr;
            this.loadProjectsByCustomer();
          },
          error: err => {
            console.error(
              'Error cargando cliente:',
              err
            );
            this.loadProjectsByCustomer();
          }
        });
    }
  }

  onCustomerChange(): void {
    if (!this.selectedCustCode) {
      return;
    }
    this.userCustCode =
    this.selectedCustCode;
    this.selectedProject = '';
    this.selectedProjectName = null;
    this.projectOptions = [];
    localStorage.removeItem(
      'selectedSelection'
    );
    this.loadCustomerData(
      this.selectedCustCode
    );
  }

  loadProjectsByCustomer(): void {
    if (!this.userCustCode) {
      return;
    }
    const custCode =
      this.userCustCode.trim();
    this.projService
      .getByCust(custCode)
      .subscribe({
        next: projects => {    
          const map =
            new Map<
              string,
              {
                proj_code: string;
                proj_name: string;
              }
            >();
          projects.forEach((p: any) => {
            if (
              !p.proj_code ||
              !p.proj_name
            ) {
              return;
            }
            const code =
              String(
                p.proj_code
              ).trim();
            const name =
              String(
                p.proj_name
              ).trim();            
            if (
              this.userProjects.length > 0 &&
              !this.userProjects.includes(code)
            ) {    
              return;
            }
            if (!map.has(code)) {
              map.set(code, {
                proj_code: code,
                proj_name: name
              });
            }
          });
          this.projectOptions =
            Array.from(
              map.values()
            );                  
          const stored =
            localStorage.getItem(
              'selectedSelection'
            );

          if (!stored) {
            this.selectedProject = '';
            this.selectedProjectName = null;
            return;
          }
          try {
            const parsed =
              JSON.parse(stored);
            const storedCust =
              String(
                parsed.custCode || ''
              ).trim();
            const storedProj =
              String(
                parsed.projCode || ''
              ).trim();            
            if (
              storedCust !== custCode
            ) {
              this.selectedProject = '';
              this.selectedProjectName = null;
              return;
            }          
            const exists =
              this.projectOptions.find(
                p =>
                  p.proj_code ===
                  storedProj
              );
            if (!exists) {
              this.selectedProject = '';
              this.selectedProjectName = null;
              return;
            }

            this.selectedProject =
              storedProj;
            this.selectedProjectName =
              exists.proj_name;       
          } catch (error) {
            console.error(
              'Error procesando selectedSelection:',
              error
            );
            this.selectedProject = '';
            this.selectedProjectName = null;
          }
        },
        error: err => {
          console.error(
            '❌ ERROR OBTENIENDO PROYECTOS:',
            err
          );
          this.projectOptions = [];
        }
      });
  }

  private resolveSelectedProjectName(): void {
    if (!this.selectedProject) {
      this.selectedProjectName =
        null;
      return;
    }
    const found =
      this.projectOptions.find(
        p =>
          p.proj_code ===
          this.selectedProject.trim()
      );
    this.selectedProjectName =
      found?.proj_name ||
      this.selectedProject;
  }

  onSelectProject(): void {
    if (
      this.selectedProject &&
      this.userCustCode
    ) {
      const selection = {
        custCode:
          this.userCustCode.trim(),
        projCode:
          this.selectedProject.trim()
      };
      localStorage.setItem(
        'selectedSelection',
        JSON.stringify(selection)
      );   
      this.resolveSelectedProjectName();
      // Si quieres que al seleccionar la obra
      // se haga inmediatamente la búsqueda:
      // this.onSearch(true);
    }

    if (!this.selectedProject) {

      localStorage.removeItem(
        'selectedSelection'
      );

      this.selectedProjectName =
        null;
    }
  }

  onSearch(resetPage: boolean = false): void {
    if (!this.selectedProject?.trim()) {
      console.log(
        '❌ No se puede buscar: no hay proyecto seleccionado'
      );
      this.hasSearched = false;
      this.results = [];
      this.noResults = false;
      return;
    }
    this.hasSearched = true;
    if (!this.userCustCode) {
      return;
    }
    if (resetPage) {
      this.page = 1;
    }
    this.loading = true;
    const params: any = {
      custCode:
        this.userCustCode.trim(),
      page:
        this.page,
      limit:
        this.limit,
      // El proyecto ahora es obligatorio
      projCode:
        this.selectedProject.trim()
    };
    if (this.filterDocNumber?.trim()) {
      params.docNumber =
        this.filterDocNumber.trim();
    }
    if (this.filterDateFrom) {
      params.dateFrom =
        this.filterDateFrom;
    }
    if (this.filterDateTo) {
      params.dateTo =
        this.filterDateTo;
    }
    console.log(
      'BUSCANDO DOCUMENTOS CON:',
      params
    );
    this.tickService
      .searchTicks(params)
      .subscribe({
        next: (res: any) => {
          this.results =
            (res.data ?? [])
              .sort(
                (a: any, b: any) =>
                  new Date(
                    b.order_date
                  ).getTime() -
                  new Date(
                    a.order_date
                  ).getTime()
              )
              .map(
                (ticket: any) => ({
                  ...ticket,
                  selected:
                    this.selectedTickets.has(
                      String(
                        ticket.tkt_code
                      ).trim()
                    )
                })
              );
          this.noResults =
            this.results.length === 0;

          this.showDownloadFiltered =
            this.results.length > 0;

          this.selectAll =
            this.results.length > 0 &&
            this.results.every(
              t => t.selected
            );

          this.totalItems =
            res.total ?? 0;

          this.totalPages =
            res.totalPages ?? 1;

          this.loading = false;
        },
        error: err => {
          console.error(
            'Error buscando documentos:',
            err
          );
          this.results = [];
          this.noResults = true;
          this.loading = false;
        }
      });
  }

  // ============================================================
  // RESTO DE MÉTODOS
  // ============================================================

  onDocNumberInput(value: string) {

    this.filterDocNumber =
      value
        .replace(/[^0-9]/g, '')
        .slice(0, 10);
  }

  allowOnlyNumbers(
    event: KeyboardEvent
  ) {

    const key = event.key;

    if (
      event.ctrlKey ||
      event.metaKey
    ) {
      return;
    }

    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab'
    ];

    if (
      allowedKeys.includes(key)
    ) {
      return;
    }

    if (
      !/^[0-9]$/.test(key)
    ) {
      event.preventDefault();
    }
  }

  toggleAll() {

    this.results.forEach(ticket => {

      ticket.selected =
        this.selectAll;

      const code =
        String(
          ticket.tkt_code
        ).trim();

      if (!code) return;

      if (this.selectAll) {

        this.selectedTickets.add(
          code
        );

      } else {

        this.selectedTickets.delete(
          code
        );
      }
    });
  }

  updateTicketSelection(
    ticket: any
  ) {

    const code =
      String(
        ticket.tkt_code
      ).trim();

    if (!code) return;

    if (ticket.selected) {

      this.selectedTickets.add(
        code
      );

    } else {

      this.selectedTickets.delete(
        code
      );
    }

    this.selectAll =
      this.results.length > 0 &&
      this.results.every(
        t => t.selected
      );
  }

  clearFilter() {

    this.selectedProject = '';
    this.selectedProjectName = null;

    this.filterWork = '';
    this.filterDocNumber = '';
    this.filterDocType = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';

    localStorage.removeItem(
      'selectedSelection'
    );

    this.onSearch(true);
  }

  isService(tick: any): boolean {

    return (
      tick?.prod_descr
        ?.toUpperCase() ===
      'SERVICIO BOMBEO'
    );
  }

  getProjectName(
    code: string
  ): string {

    const proj =
      this.projectOptions.find(
        p =>
          p.proj_code ===
          code?.trim()
      );

    return (
      proj?.proj_name ||
      code
    );
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
    const hasProject =
      !!this.selectedProject?.trim();
    const hasDocNumber =
      !!this.filterDocNumber?.trim();
    const hasBothDates =
      !!this.filterDateFrom &&
      !!this.filterDateTo;
    return (
      hasProject &&
      (hasDocNumber || hasBothDates)
    );
  }

  prevPage() {

    if (this.page > 1) {

      this.page--;

      this.onSearch();
    }
  }

  nextPage() {

    if (
      this.page <
      this.totalPages
    ) {

      this.page++;

      this.onSearch();
    }
  }

  // ============================================================
  // DESCARGAS
  // ============================================================

  downloadExcel() {

    if (!this.userCustCode)
      return;

    this.loading = true;

    const filters: any = {

      custCode:
        this.userCustCode.trim()
    };

    if (
      this.selectedProject?.trim()
    ) {

      filters.projCode =
        this.selectedProject.trim();
    }

    if (
      this.filterDocNumber?.trim()
    ) {

      filters.docNumber =
        this.filterDocNumber.trim();
    }

    if (this.filterDateFrom)
      filters.dateFrom =
        this.filterDateFrom;

    if (this.filterDateTo)
      filters.dateTo =
        this.filterDateTo;

    this.tickService
      .getAllForExcel(filters)
      .subscribe({

        next: (data: any[]) => {

          this.generateExcel(data);

          this.loading = false;
        },

        error: err => {

          console.error(
            'Error exportando Excel:',
            err
          );

          this.loading = false;
        }
      });
  }

  private generateExcel(
    data: any[]
  ) {

    if (!data.length)
      return;

    const worksheet =
      XLSX.utils.json_to_sheet(
        data
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Documentos'
    );

    const headerCells =
      Object.keys(
        data[0]
      ).map(
        (_, i) =>
          XLSX.utils.encode_cell({
            r: 0,
            c: i
          })
      );

    headerCells.forEach(
      cell => {

        if (!worksheet[cell])
          return;

        worksheet[cell].s = {

          font: {
            bold: true
          },

          alignment: {
            horizontal:
              'center'
          }
        };
      }
    );

    const excelBuffer =
      XLSX.write(
        workbook,
        {
          bookType: 'xlsx',
          type: 'array',
          cellStyles: true
        }
      );

    const blob =
      new Blob(
        [excelBuffer],
        {
          type:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      );

    saveAs(
      blob,
      `documentos_completos_${Date.now()}.xlsx`
    );
  }

  downloadAllFiltered() {

    if (!this.userCustCode)
      return;

    const filters: any = {

      custCode:
        this.userCustCode.trim()
    };

    if (
      this.selectedProject?.trim()
    ) {

      filters.projCode =
        this.selectedProject.trim();
    }

    if (
      this.filterDocNumber?.trim()
    ) {

      filters.docNumber =
        this.filterDocNumber.trim();
    }

    if (this.filterDateFrom)
      filters.dateFrom =
        this.filterDateFrom;

    if (this.filterDateTo)
      filters.dateTo =
        this.filterDateTo;

    this.loadingDownload.set(true);

    this.tickService
      .downloadAllFiltered(filters)
      .subscribe({

        next: (res: any) => {

          this.descargarBlob(
            res.body!,
            `Guias_${Date.now()}.zip`
          );

          this.loadingDownload.set(false);
        },

        error: err => {

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
      Array.from(
        this.selectedTickets
      );

    if (!selectedCodes.length) {

      alert(
        'Debes seleccionar al menos una guía.'
      );

      return;
    }

    this.loadingDownload.set(true);

    this.tickService
      .downloadZipByCodes(
        selectedCodes
      )
      .subscribe({

        next: (res: any) => {

          this.descargarBlob(
            res.body!,
            `Guias_${Date.now()}.zip`
          );

          this.loadingDownload.set(false);
        },

        error: err => {

          this.loadingDownload.set(false);

          if (
            err.status === 404
          ) {

            const reader =
              new FileReader();

            reader.onload = () => {

              const data =
                JSON.parse(
                  reader.result as string
                );

              alert(
                `No se encontraron PDFs.\nGuias faltantes: ${data.missing.join(', ')}`
              );
            };

            reader.readAsText(
              err.error
            );

            return;
          }

          console.error(err);

          alert(
            'Error descargando guías'
          );
        }
      });
  }

  private descargarBlob(
    blob: Blob,
    nombreArchivo = 'documentos.zip'
  ) {

    const url =
      window.URL.createObjectURL(
        blob
      );

    const a =
      document.createElement('a');

    a.href = url;

    a.download =
      nombreArchivo;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    window.URL.revokeObjectURL(
      url
    );
  }

  downloadTicket(
    tkt_code: string
  ) {

    if (!tkt_code)
      return;

    this.loadingDownload.set(true);

    this.tickService
      .downloadTickPDF(tkt_code)
      .subscribe({

        next: (blob: Blob) => {

          const url =
            window.URL.createObjectURL(
              blob
            );

          const link =
            document.createElement(
              'a'
            );

          link.href = url;

          link.download =
            `${tkt_code}.pdf`;

          link.click();

          window.URL.revokeObjectURL(
            url
          );

          this.loadingDownload.set(false);
        },

        error: err => {

          this.loadingDownload.set(false);

          if (err.status === 404) {

            alert(
              `⚠️ La guía ${tkt_code} no se encuentra en la carpeta. No se puede descargar.`
            );

          } else {

            console.error(
              'Error descargando ticket:',
              err
            );

            alert(
              'Ocurrió un error al intentar descargar la guía.'
            );
          }
        }
      });
  }

  handleClearFilters() {
    this.filterDocType = '';
    this.filterDocNumber = '';
    this.filterDateFrom = null;
    this.filterDateTo = '';
    this.results = [];
    this.showDownloadFiltered = false;
    this.noResults = false;
    this.hasSearched = false;
  }
}