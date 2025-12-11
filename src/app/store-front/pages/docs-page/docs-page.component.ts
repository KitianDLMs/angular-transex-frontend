import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';

import { TickService } from '@products/services/tick.service';
import { ProjService } from '@shared/services/proj.service';
import { ProdService } from '@shared/services/prod.service';
import { AuthService } from '@auth/services/auth.service';
import { CustService } from '@dashboard/cust/services/cust.service';

@Component({
  selector: 'app-docs-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './docs-page.component.html',
})
export class DocsPageComponent implements OnInit {

  tickService = inject(TickService);
  projService = inject(ProjService);
  prodService = inject(ProdService); 
  authService = inject(AuthService);
  custService = inject(CustService);
  customerName: string = '';
  customerAddress: string = '';

  today = new Date();
  currentYear = new Date().getFullYear();
  userCustCode: string | null = null;
  projectOptions: { proj_code: string; proj_name: string }[] = [];

  // -------------------------
  // 🔹 Filtros
  // -------------------------
  filterWork: string = '';
  filterDocType: string = '';
  filterDocNumber: string = '';
  filterDateFrom: string = '';
  filterDateTo: string = '';

  // Proyecto (filtro anterior)
  selectedProject: string = '';

  // -------------------------
  // 🔹 Datos
  // -------------------------
  loading = signal(true);      // Usado como isLoading
  results: any[] = [];         // Reemplaza "ticks"

  // -------------------------
  // 🔹 Resource inicial
  // -------------------------
  ticksResource = rxResource({
    request: () => ({}),
    loader: () =>
      this.tickService.getTicks().pipe(
        tap(r => {
          console.log("📦 Ticks cargados:", r);
          this.results = r; // Los cargamos en results
          this.loading.set(false);
        }),
        catchError(err => {
          console.error("❌ Error al cargar ticks:", err);
          this.loading.set(false);
          return of([]);
        })
      )
  });

  ngOnInit() {
    const user = this.authService.user();
    this.userCustCode = user?.cust_code || null;
    if (this.userCustCode) {
      this.custService.getCustByCode(this.userCustCode).subscribe(cust => {
        this.customerName = cust.name || 'Sin nombre';
        this.customerAddress = cust.addr_line_1 || 'Sin dirección';
      });
      this.projService.getByCustomer(this.userCustCode).subscribe(opts => {
        this.projectOptions = opts.map(p => ({
          proj_code: p.proj_code,
          proj_name: p.proj_name
        }));
      });
    }
    // this.loadProductsByCustomer();
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
    this.loading.set(true);

    this.tickService.getTicks().subscribe({
      next: (data: any[]) => {
        let filtered = data;

        if (this.filterWork.trim()) {
          filtered = filtered.filter(x =>
            (x.project_name || '').toLowerCase().includes(
              this.filterWork.toLowerCase()
            )
          );
        }

        if (this.filterDocNumber.trim()) {
          filtered = filtered.filter(x =>
            (x.guide_number || '').toString()
              .includes(this.filterDocNumber)
          );
        }

        if (this.selectedProject.trim()) {
          filtered = filtered.filter(x =>
            x.project_code === this.selectedProject
          );
        }

        if (this.filterDateFrom) {
          const from = new Date(this.filterDateFrom);
          filtered = filtered.filter(x => new Date(x.date) >= from);
        }

        if (this.filterDateTo) {
          const to = new Date(this.filterDateTo);
          filtered = filtered.filter(x => new Date(x.date) <= to);
        }

        this.results = filtered;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  downloadGuide(tick: any) {
    console.log("Descargar guía del tick:", tick);
    const guideId = tick.order_code || tick.tkt_code;

    if (!guideId) {
      alert("No existe código de guía para descargar.");
      return;
    }

    this.tickService.downloadGuide(guideId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `guia_${guideId}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        alert("Error al descargar la guía.");
      }
    });
  }

  downloadExcel(tick: any) {
    console.log("Descargar Excel para:", tick);
  }

  downloadPdf(tick: any) {
    console.log("Descargar PDF para:", tick);
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
