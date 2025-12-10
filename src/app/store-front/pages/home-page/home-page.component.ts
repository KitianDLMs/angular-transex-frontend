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
import { OrdrService } from '@shared/services/ordr.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent implements OnInit {

  projService = inject(ProjService);
  prodService = inject(ProdService); 
  authService = inject(AuthService);
  custService = inject(CustService);
  imstService = inject(OrdrService);
  paginationService = inject(PaginationService);
  baseUrl = environment.baseUrl;

  expandedOrder: string | null = null;
  orderLines: any[] = [];
  expandedCode: string | null = null;
  productLines: any[] = [];


  customerName: string | null = null;
  customerAddress: string | null = null;
  
  projectOptions: { proj_code: string; proj_name: string }[] = [];
  selectedProject = "";

  today = new Date();
  currentYear = new Date().getFullYear();
  userCustCode: string | null = null;

  projects: any[] = [];

  constructor(
    private httpClient: HttpClient,    
  ) {}

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
    this.loadProductsByCustomer();
  }
   
  toggle(prod: any) {
    if (this.expandedCode === prod.item_code) {
      this.expandedCode = null;
      return;
    }

    this.expandedCode = prod.item_code;

    this.prodService.getLinesByItem(prod.item_code).subscribe(res => {
      console.log(res);      
      this.productLines = res;
    });
  }

  loadProductsByCustomer() {
    if (!this.userCustCode) return;
    this.prodService.getByCustomer(this.userCustCode).subscribe(res => {
      this.imstResource.set(res);
    });
  }

  loadProjectsForUser() {
    if (!this.userCustCode) return;

    this.projService.getByCustomer(this.userCustCode).subscribe(res => {
      this.projects = res;
    });
  }

  imstResource = rxResource<any, any>({
    request: () => ({ cust: this.userCustCode }),
    loader: (params: any) =>
      this.prodService.getByCustomer(params.cust).pipe(
        tap(r => console.log("📦 Productos por cliente:", r)),
        catchError(err => {
          console.error("❌ Error IMST:", err);
          return of([]);
        })
      )
  });

  onSelectProject() {
    if (!this.selectedProject) {      
      this.loadProductsByCustomer();
      return;
    }    
    this.prodService.getByProject(this.selectedProject).subscribe(res => {
      this.imstResource.set(res);
    });
  }

  clearFilter() {
    this.selectedProject = '';
    this.loadProductsByCustomer();
  }
}
