import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProjService } from '@shared/services/proj.service';
import { AuthService } from '@auth/services/auth.service';
import { PaginationService } from '@shared/components/pagination/pagination.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';
import { ProdService } from '@shared/services/prod.service';
import { CustService } from '@dashboard/cust/services/cust.service';

@Component({
  selector: 'app-laboratorio-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './laboratorio-page.component.html',
})
export class LaboratorioPageComponent implements OnInit {

  projService = inject(ProjService);
  prodService = inject(ProdService); 
  authService = inject(AuthService);
  paginationService = inject(PaginationService);
  custService = inject(CustService);  

  projectOptions: { proj_code: string; proj_name: string }[] = [];
  selectedProject: string | null = null;
  customerName = '';
  customerAddress = '';

  today = new Date();
  currentYear = new Date().getFullYear();
  userCustCode: string | null = null;

  projects: any[] = [];

  ngOnInit() {
    const user = this.authService.user();
    this.userCustCode = user?.cust_code || null;

    this.custService.getCustByCode(this.userCustCode!).subscribe(cust => {
      this.customerName = cust.name ?? 'Sin nombre';
      this.customerAddress = cust.addr_line_1 ?? 'Sin dirección';
    });
    if (this.userCustCode) {
      this.projService.getByCustomer(this.userCustCode).subscribe(opts => {
        this.projectOptions = opts.map(p => ({
          proj_code: p.proj_code,
          proj_name: p.proj_name
        }));
      });
    }
    this.imstResource.reload();
  }

  loadProjectsForUser() {
    if (!this.userCustCode) return;

    this.projService.getByCustomer(this.userCustCode).subscribe(res => {
      this.projects = res;
    });
  }

  imstResource = rxResource({
    request: () => ({}),
    loader: () =>
      this.prodService.getAll().pipe(
        tap(r => console.log("📦 IMST cargados:", r)),
        catchError(err => {
          console.error("❌ Error IMST:", err);
          return of([]);
        })
      )
  });

  onSelectProject() {
    if (!this.selectedProject) {
      this.imstResource.reload();
      return;
    }

    this.prodService.getByProject(this.selectedProject).subscribe(res => {
      this.imstResource.set(res);
    });
  }

  clearFilter() {
    this.selectedProject = '';
    this.imstResource.reload();
  }
}
