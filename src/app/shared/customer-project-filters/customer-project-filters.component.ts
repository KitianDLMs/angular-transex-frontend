import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { AuthService } from '@auth/services/auth.service';
import { CustService } from '@dashboard/cust/services/cust.service';
import { ProjService } from '@shared/services/proj.service';

/* 🔹 Interface de filtros */
export interface CustomerProjectFilters {
  custCode: string | null;
  projectCode: string | null;
}

@Component({
  selector: 'app-customer-project-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-project-filters.component.html',
})
export class CustomerProjectFiltersComponent implements OnInit {

  /* 🔹 Services */
  authService = inject(AuthService);
  custService = inject(CustService);
  projService = inject(ProjService);

  /* 🔹 Output */
  @Output() filtersChange = new EventEmitter<CustomerProjectFilters>();

  /* 🔹 Estado de clientes */
  userCustCodes: string[] = [];
  selectedCustCode: string | null = null;

  customersData: {
    [code: string]: { name: string; addr: string }
  } = {};

  /* 🔹 Estado de proyectos */
  projectOptions: { proj_code: string; proj_name: string }[] = [];
  selectedProject: string | null = null;

  /* 🔹 Usuario */
  currentUser: any;

  /* ======================================================
     INIT
  ====================================================== */
  ngOnInit(): void {
    this.currentUser = this.authService.user();
    if (!this.currentUser) return;

    this.userCustCodes = this.currentUser.cust_codes || [];

    // 🔹 Usuario con un solo cliente
    if (this.userCustCodes.length <= 1) {
      this.selectedCustCode =
        this.userCustCodes[0] || this.currentUser.cust_code;

      if (this.selectedCustCode) {
        this.loadCustomer(this.selectedCustCode);
        this.loadProjects(this.selectedCustCode);
        this.emitFilters();
      }
      return;
    }

    // 🔹 Usuario con múltiples clientes
    this.loadMultipleCustomers();
  }

  /* ======================================================
     CARGA DE CLIENTES
  ====================================================== */
  private loadCustomer(code: string) {
    this.custService.getCustByCode(code).subscribe(cust => {
      this.customersData[code] = {
        name: cust?.name || 'Sin nombre',
        addr: cust?.addr_line_1 || 'Sin dirección'
      };
    });
  }

  private loadMultipleCustomers() {
    const requests = this.userCustCodes.map(code =>
      this.custService.getCustByCode(code)
    );

    forkJoin(requests).subscribe(customers => {
      customers.forEach((cust, index) => {
        const code = this.userCustCodes[index];
        this.customersData[code] = {
          name: cust?.name || 'Sin nombre',
          addr: cust?.addr_line_1 || 'Sin dirección'
        };
      });

      // Ordenar clientes por nombre
      this.userCustCodes.sort((a, b) =>
        this.customersData[a].name.localeCompare(
          this.customersData[b].name,
          'es',
          { sensitivity: 'base' }
        )
      );

      this.selectedCustCode = this.userCustCodes[0];
      this.loadProjects(this.selectedCustCode);
      this.emitFilters();
    });
  }

  /* ======================================================
     CARGA DE PROYECTOS
  ====================================================== */
  private loadProjects(custCode: string) {
    const allowedProjects = (this.currentUser?.projects || [])
      .map((p: any) => String(p).trim());    
    this.projService.getByCust(custCode).subscribe({
      next: (projects) => {    
        const map = new Map<
          string,
          { proj_code: string; proj_name: string }
        >();
        projects.forEach((p: any) => {
          if (!p?.proj_code || !p?.proj_name) {
            return;
          }
          const code = String(p.proj_code).trim();
          const name = String(p.proj_name).trim();
          if (!allowedProjects.includes(code)) {
            return;
          }
          if (!map.has(code)) {
            map.set(code, {
              proj_code: code,
              proj_name: name
            });
          }
        });
        this.projectOptions = Array.from(map.values());   
        // =====================================
        // RECUPERAR SELECCIÓN DEL STORAGE
        // =====================================
        const stored =
          localStorage.getItem('selectedSelection');
        if (!stored) {       
          return;
        }
        const selection = JSON.parse(stored);
        const storedCustCode =
          String(selection.custCode || '').trim();
        const storedProjCode =
          String(selection.projCode || '').trim();     
        // =====================================
        // VALIDAR CLIENTE
        // =====================================
        if (
          storedCustCode !==
          String(custCode).trim()
        ) {
          return;
        }
        // =====================================
        // VALIDAR PROYECTO
        // =====================================
        const selectedExists =
          this.projectOptions.some(
            p =>
              p.proj_code === storedProjCode
          );
        if (selectedExists) {
          this.selectedProject =
            storedProjCode;  
        } else {
          this.selectedProject = null;
        }
        this.emitFilters();
      },

      error: (error) => {

        console.error(
          '❌ ERROR CARGANDO PROYECTOS:',
          error
        );

        this.projectOptions = [];
        this.selectedProject = null;

        this.emitFilters();
      }
    });
  }

  /* ======================================================
     EVENTOS DE UI
  ====================================================== */
  onCustomerChange() {
    if (!this.selectedCustCode) return;

    this.selectedProject = null;
    this.loadProjects(this.selectedCustCode);
    this.emitFilters();
  }

  onProjectChange() {
    console.log('PROYECTO SELECCIONADO:', this.selectedProject);
    if (this.selectedCustCode && this.selectedProject) {
      localStorage.setItem(
        'selectedSelection',
        JSON.stringify({
          custCode: this.selectedCustCode,
          projCode: this.selectedProject
        })
      );
    } else {
      localStorage.removeItem('selectedSelection');
    }
    this.emitFilters();
  }

  /* ======================================================
     EMITIR FILTROS
  ====================================================== */
  private emitFilters() {
    this.filtersChange.emit({
      custCode: this.selectedCustCode,
      projectCode: this.selectedProject
    });
  }
}

