import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from '@auth/services/auth.service';
import { CustService } from '@dashboard/cust/services/cust.service';
import { ProjService } from '@shared/services/proj.service';

import { forkJoin, map } from 'rxjs';

@Component({
  selector: 'app-customer-project-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-project-page.component.html',
})
export class CustomerProjectPageComponent implements OnInit {

  authService = inject(AuthService);
  custService = inject(CustService);
  projService = inject(ProjService);

  today = new Date();
  currentUser: any = null;

  userCustCodes: string[] = [];
  selectedCustCode: string | null = null;
  customersData: { [code: string]: { name: string; addr: string } } = {};

  selectedProject: string = '';
  projectOptions: { proj_code: string; proj_name: string }[] = [];

  customerName: string | null = null;

  get selectedProjectData() {
    return this.projectOptions.find(
      p => p.proj_code === this.selectedProject
    );
  }

  get hasSelectedProject(): boolean {
    return !!this.selectedProject;
  }

  get isSelectionComplete(): boolean {
    if (this.authService.isAdmin()) {
      return !!this.selectedCustCode && !!this.selectedProject;
    }
    return !!this.selectedProject;
  }

  ngOnInit() {
    this.currentUser = this.authService.user();
    if (!this.currentUser) return;

    const stored = localStorage.getItem('selectedSelection');
    let parsed: any = null;

    if (stored) {
      parsed = JSON.parse(stored);
      this.selectedCustCode = parsed.custCode;
      this.selectedProject = parsed.projCode;
    }

    this.userCustCodes = this.currentUser.cust_codes || [];

    if (this.userCustCodes.length <= 1) {
      this.selectedCustCode =
        this.userCustCodes[0] || this.currentUser.cust_code;

      this.loadCustomerData(this.selectedCustCode!);
    } else {
      const observables = this.userCustCodes.map(code =>
        this.custService.getCustByCode(code).pipe(
          map(cust => ({
            code,
            name: cust.name || 'Sin nombre',
            addr: cust.addr_line_1 || 'Sin dirección'
          }))
        )
      );

      forkJoin(observables).subscribe(customers => {
        customers.sort((a, b) =>
          a.name.toUpperCase().localeCompare(b.name.toUpperCase())
        );

        this.userCustCodes = customers.map(c => c.code);

        customers.forEach(c => {
          this.customersData[c.code] = {
            name: c.name,
            addr: c.addr
          };
        });

        // 🔥 Si había cliente guardado, lo respetamos
        if (!this.selectedCustCode) {
          this.selectedCustCode = this.userCustCodes[0];
        }

        this.loadCustomerData(this.selectedCustCode!);
      });
    }
  }

  onConfirmSelection() {
    if (!this.selectedCustCode || !this.selectedProject) return;
    localStorage.setItem(
      'selectedSelection',
      JSON.stringify({
        custCode: this.selectedCustCode,
        projCode: this.selectedProject
      })
    );
  }

  onCustomerChange() {
    if (!this.selectedCustCode) return;

    this.selectedProject = '';
    localStorage.removeItem('selectedSelection');

    this.projectOptions = [];
    this.loadCustomerData(this.selectedCustCode);
  }

  loadCustomerData(custCode: string) {
    this.selectedCustCode = custCode;

    this.custService.getCustByCode(custCode).subscribe(c => {
      this.customerName = c.name;
    });

    this.loadProjects();
  }

  loadProjects() {
    if (!this.selectedCustCode) return;
    const allowedProjects = this.currentUser?.projects ?? [];
    this.projService.getByCust(this.selectedCustCode).subscribe({
      next: projects => {        
        this.projectOptions = projects
          .filter((p: any) => {
            const code = String(p.proj_code).trim();
            const allowed = allowedProjects.some(
              (x: any) => String(x).trim() === code
            );  
            return allowed;
          })
          .map((p: any) => ({
            proj_code: String(p.proj_code).trim(),
            proj_name: String(p.proj_name).trim()
          }));
      },
      error: err => {
        console.error('ERROR PROYECTOS:', err);
      }
    });
  }

  onSelectProject() {
    if (this.selectedProject && this.selectedCustCode) {
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
  }

  clearFilter() {
    this.selectedProject = '';
    localStorage.removeItem('selectedSelection');
  }
}
