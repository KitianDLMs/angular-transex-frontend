import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '@auth/services/auth.service';
import { CustService } from '@dashboard/cust/services/cust.service';
import { ProjService } from '@shared/services/proj.service';

import {
  ProdReportService,
  ProductReport
} from '@shared/services/prod-report.service';

import { forkJoin, map } from 'rxjs';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent implements OnInit {

  // =========================================================
  // SERVICES
  // =========================================================

  authService = inject(AuthService);
  custService = inject(CustService);
  projService = inject(ProjService);
  prodReportService = inject(ProdReportService);

  // =========================================================
  // USUARIO / CLIENTE
  // =========================================================

  currentUser: any = null;

  userCustCode: string | null = null;
  selectedCustCode: string | null = null;

  userCustCodes: string[] = [];

  customerName: string | null = null;
  customerAddress: string | null = null;

  customersData: {
    [code: string]: {
      name: string;
      addr: string;
    }
  } = {};

  // =========================================================
  // PROYECTO
  // =========================================================

  selectedProject = '';

  storedProject: string | null = null;

  selectedProjectName: string | null = null;

  projectOptions: {
    proj_code: string;
    proj_name: string;
  }[] = [];

  // =========================================================
  // PRODUCTOS
  // =========================================================

  products: ProductReport[] = [];

  expandedGroup: string | null = null;

  // =========================================================
  // PAGINACIÓN
  // =========================================================

  page = 1;
  limit = 10;
  totalPages = 1;

  loading = false;

  // =========================================================
  // FECHAS
  // =========================================================

  today = new Date();
  currentYear = new Date().getFullYear();

  // =========================================================
  // INIT
  // =========================================================

  ngOnInit(): void {
    this.currentUser = this.authService.user();

    if (!this.currentUser) {
      console.log('❌ No existe usuario');
      return;
    }
    const stored = localStorage.getItem('selectedSelection');

    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        this.userCustCode = parsed.custCode || null;
        this.selectedCustCode = parsed.custCode || null;

        this.storedProject = parsed.projCode || null;

        // 🔥 ESTA ES LA CLAVE
        if (parsed.projCode) {
          this.selectedProject = String(parsed.projCode).trim();
        }

      } catch (error) {

        console.error(
          '❌ Error leyendo selectedSelection:',
          error
        );

      }
    }

    // ---------------------------------------------------------
    // 2. CLIENTES DEL USUARIO
    // ---------------------------------------------------------

    this.userCustCodes =
      this.currentUser.cust_codes || [];

    // ---------------------------------------------------------
    // USUARIO CON UN SOLO CLIENTE
    // ---------------------------------------------------------

    if (this.userCustCodes.length <= 1) {

      const custCode =
        this.userCustCode ||
        this.userCustCodes[0] ||
        this.currentUser.cust_code;

      if (!custCode) {
        return;
      }

      this.selectedCustCode = custCode;
      this.userCustCode = custCode;

      this.custService
        .getCustByCode(custCode)
        .subscribe(cust => {

          this.customersData[custCode] = {
            name: cust?.name || 'Sin nombre',
            addr: cust?.addr_line_1 || 'Sin dirección'
          };

          this.customerName =
            cust?.name || 'Sin nombre';

          this.customerAddress =
            cust?.addr_line_1 || null;

          // 🔥 CARGAR PROYECTOS
          this.loadProjects();
        });

      return;
    }

    // ---------------------------------------------------------
    // USUARIO CON MÚLTIPLES CLIENTES
    // ---------------------------------------------------------

    const observables =
      this.userCustCodes.map(code =>
        this.custService
          .getCustByCode(code)
          .pipe(
            map(cust => ({
              code,
              name: cust?.name || 'Sin nombre',
              addr: cust?.addr_line_1 || 'Sin dirección'
            }))
          )
      );

    forkJoin(observables)
      .subscribe(customers => {

        customers.sort((a, b) =>
          a.name
            .toUpperCase()
            .localeCompare(
              b.name.toUpperCase()
            )
        );

        this.userCustCodes =
          customers.map(c => c.code);

        customers.forEach(c => {

          this.customersData[c.code] = {
            name: c.name,
            addr: c.addr
          };

        });

        // -----------------------------------------------------
        // RESPETAR CLIENTE DEL STORAGE
        // -----------------------------------------------------

        if (
          this.selectedCustCode &&
          this.userCustCodes.includes(
            this.selectedCustCode
          )
        ) {

          this.userCustCode =
            this.selectedCustCode;

        } else {

          this.selectedCustCode =
            this.userCustCodes[0];

          this.userCustCode =
            this.selectedCustCode;
        }

        // -----------------------------------------------------
        // CARGAR DATOS
        // -----------------------------------------------------

        const data =
          this.customersData[
            this.userCustCode!
          ];

        if (data) {

          this.customerName = data.name;
          this.customerAddress = data.addr;

        }

        this.loadProjects();

      });
  }

  // =========================================================
  // PROYECTO SELECCIONADO
  // =========================================================

  get hasSelectedProject(): boolean {
    return !!this.selectedProject;
  }

  // =========================================================
  // NOMBRE DEL PROYECTO
  // =========================================================

  private resolveSelectedProjectName(): void {

    if (!this.selectedProject) {

      this.selectedProjectName = null;

      return;
    }

    const found =
      this.projectOptions.find(
        p =>
          String(p.proj_code).trim() ===
          String(this.selectedProject).trim()
      );

    this.selectedProjectName =
      found?.proj_name ||
      this.selectedProject;

    console.log(
      'NOMBRE PROYECTO:',
      this.selectedProjectName
    );
  }

  // =========================================================
  // CAMBIO DE CLIENTE
  // =========================================================

  onCustomerChange(): void {

    if (!this.selectedCustCode) {
      return;
    }

    console.log(
      'CAMBIO DE CLIENTE:',
      this.selectedCustCode
    );

    this.userCustCode =
      this.selectedCustCode;

    // Al cambiar cliente se debe limpiar proyecto
    this.selectedProject = '';
    this.selectedProjectName = null;

    // Guardar nueva selección
    localStorage.setItem(
      'selectedSelection',
      JSON.stringify({
        custCode: this.selectedCustCode,
        projCode: ''
      })
    );

    this.loadCustomerData(
      this.selectedCustCode
    );
  }

  // =========================================================
  // DATOS DEL CLIENTE
  // =========================================================

  loadCustomerData(
    custCode: string
  ): void {

    this.userCustCode = custCode;

    const data =
      this.customersData[custCode];

    if (data) {

      this.customerName = data.name;
      this.customerAddress = data.addr;

    } else {

      this.custService
        .getCustByCode(custCode)
        .subscribe(cust => {

          this.customerName =
            cust?.name || 'Sin nombre';

          this.customerAddress =
            cust?.addr_line_1 || null;

        });

    }

    this.loadProjects();
  }

  // =========================================================
  // CARGAR PROYECTOS
  // =========================================================

  loadProjects(): void {

    if (!this.userCustCode) {
      console.log(
        '❌ No existe userCustCode'
      );
      return;
    }

    const allowedProjects =
      (this.currentUser?.projects || [])
        .map((p: any) =>
          String(p).trim()
        );

    this.projService
      .getByCust(this.userCustCode)
      .subscribe({

        next: (projects: any[]) => {
          const map =
            new Map<
              string,
              {
                proj_code: string;
                proj_name: string;
              }
            >();

          projects.forEach((p: any) => {

            // API devuelve proj_code / proj_name
            if (
              !p?.proj_code ||
              !p?.proj_name
            ) {
              return;
            }

            const code =
              String(p.proj_code).trim();

            const name =
              String(p.proj_name).trim();

            // -----------------------------------------------
            // PROYECTOS PERMITIDOS
            // -----------------------------------------------

            if (
              !allowedProjects.includes(code)
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
            Array.from(map.values());

          // =================================================
          // RESTAURAR PROYECTO
          // =================================================

          const stored =
            localStorage.getItem(
              'selectedSelection'
            );

          if (!stored) {

            this.selectedProject = '';
            this.selectedProjectName = null;

            this.loadProducts();

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
            // ---------------------------------------------
            // VALIDAR CLIENTE
            // ---------------------------------------------

            if (
              storedCust !==
              String(this.userCustCode).trim()
            ) {
              this.selectedProject = '';
              this.selectedProjectName = null;

              this.loadProducts();

              return;
            }

            // ---------------------------------------------
            // SIN PROYECTO
            // ---------------------------------------------

            if (!storedProj) {

              console.log(
                '⚠️ STORAGE NO TIENE PROYECTO'
              );

              this.selectedProject = '';
              this.selectedProjectName = null;

              this.loadProducts();

              return;
            }

            // ---------------------------------------------
            // BUSCAR PROYECTO
            // ---------------------------------------------

            const exists =
              this.projectOptions.find(
                p =>
                  String(p.proj_code).trim() ===
                  storedProj
              );

            // ---------------------------------------------
            // PROYECTO NO ENCONTRADO
            // ---------------------------------------------

            if (!exists) {

              console.log(
                '❌ PROYECTO NO ENCONTRADO:',
                storedProj
              );

              console.log(
                'PROYECTOS DISPONIBLES:',
                this.projectOptions
              );

              this.selectedProject = '';
              this.selectedProjectName = null;

              this.loadProducts();

              return;
            }

            // =================================================
            // 🔥 PROYECTO RESTAURADO
            // =================================================

            this.selectedProject =
              String(
                exists.proj_code
              ).trim();

            this.selectedProjectName =
              exists.proj_name;

            console.log(
              '========================================'
            );

            console.log(
              '✅ PROYECTO RESTAURADO EN PRODUCTOS'
            );

            console.log(
              'CÓDIGO:',
              this.selectedProject
            );

            console.log(
              'NOMBRE:',
              this.selectedProjectName
            );

            console.log(
              '========================================'
            );

            // 🔥 AHORA CARGAR PRODUCTOS
            this.loadProducts();

          } catch (error) {

            console.error(
              '❌ ERROR LEYENDO STORAGE:',
              error
            );

            this.selectedProject = '';
            this.selectedProjectName = null;

            this.loadProducts();

          }

        },

        error: error => {

          console.error(
            '❌ ERROR CARGANDO PROYECTOS:',
            error
          );

          this.projectOptions = [];

          this.selectedProject = '';
          this.selectedProjectName = null;

          this.loadProducts();

        }

      });
  }

  // =========================================================
  // CARGAR PRODUCTOS
  // =========================================================

  loadProducts(): void {

    this.loading = true;
    this.expandedGroup = null;

    console.log(
      '========================================'
    );

    console.log(
      'CARGANDO PRODUCTOS'
    );

    console.log(
      'CLIENTE:',
      this.userCustCode
    );

    console.log(
      'PROYECTO:',
      this.selectedProject
    );

    console.log(
      '========================================'
    );

    const filters: any = {

      custCode:
        this.userCustCode,

      page:
        this.page,

      limit:
        this.limit

    };

    if (this.selectedProject) {

      filters.projCode =
        this.selectedProject;

    }

    console.log(
      'FILTROS PRODUCTOS:',
      filters
    );

    this.prodReportService
      .getReport(filters)
      .subscribe({

        next: resp => {

          console.log(
            'RESPUESTA PRODUCTOS:',
            resp
          );

          const data =
            resp.data as ProductReport[];

          const map:
            Record<
              string,
              ProductReport
            > = {};

          data.forEach(p => {

            if (!map[p.codigo]) {

              map[p.codigo] = {

                codigo:
                  p.codigo,

                producto:
                  p.producto,

                respaldado:
                  0,

                utilizado:
                  0,

                saldo:
                  0,

                ordenes:
                  []

              };

            }

            if (
              !p.ordenes ||
              !p.ordenes.length
            ) {
              return;
            }

            const ordenDetalle = {

              ordencompra:
                p.ordenes[0].ordencompra,

              respaldado:
                Number(
                  p.respaldado
                ),

              utilizado:
                Number(
                  p.utilizado
                ),

              saldo:
                Number(
                  p.saldo
                )

            };

            const existing =
              map[p.codigo]
                .ordenes
                .find(
                  x =>
                    x.ordencompra
                      ?.trim() ===
                    ordenDetalle
                      .ordencompra
                      ?.trim()
                );

            if (existing) {

              existing.respaldado +=
                ordenDetalle.respaldado;

              existing.utilizado +=
                ordenDetalle.utilizado;

              existing.saldo =
                existing.respaldado -
                existing.utilizado;

            } else {

              map[p.codigo]
                .ordenes
                .push(
                  ordenDetalle
                );

            }

            map[p.codigo].respaldado =
              map[p.codigo]
                .ordenes
                .reduce(
                  (
                    sum,
                    x
                  ) =>
                    sum +
                    x.respaldado,
                  0
                );

            map[p.codigo].utilizado =
              map[p.codigo]
                .ordenes
                .reduce(
                  (
                    sum,
                    x
                  ) =>
                    sum +
                    x.utilizado,
                  0
                );

            map[p.codigo].saldo =
              map[p.codigo].respaldado -
              map[p.codigo].utilizado;

          });

          this.products =
            Object.values(map);

          this.page =
            Number(resp.page);

          this.totalPages =
            Number(resp.totalPages);

          this.loading = false;

        },

        error: err => {

          console.error(
            '❌ ERROR PRODUCTOS:',
            err
          );

          this.products = [];

          this.loading = false;

        }

      });
  }

  // =========================================================
  // SELECCIONAR PROYECTO
  // =========================================================

  onSelectProject(): void {

    this.page = 1;
    // 🔥 GUARDAR SELECCIÓN GLOBAL
    localStorage.setItem(
      'selectedSelection',
      JSON.stringify({

        custCode:
          this.userCustCode,

        projCode:
          this.selectedProject

      })
    );

    this.storedProject =
      this.selectedProject;

    this.resolveSelectedProjectName();

    this.loadProducts();
  }

  // =========================================================
  // LIMPIAR
  // =========================================================

  clearFilter(): void {

    this.selectedProject = '';

    this.selectedProjectName = null;

    this.storedProject = null;

    localStorage.removeItem(
      'selectedSelection'
    );

    this.page = 1;

    this.products = [];

    this.loading = false;
  }

  // =========================================================
  // EXPANDIR PRODUCTO
  // =========================================================

  toggleGroup(code: string): void {

    this.expandedGroup =
      this.expandedGroup === code
        ? null
        : code;

  }

  // =========================================================
  // PAGINACIÓN
  // =========================================================

  nextPage(): void {

    if (
      this.page <
      this.totalPages
    ) {

      this.page++;

      this.loadProducts();

    }

  }

  prevPage(): void {

    if (this.page > 1) {

      this.page--;

      this.loadProducts();

    }

  }
}