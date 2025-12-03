import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Proj } from 'src/app/proj/interfaces/proj.interface';
import { ProjService } from '@shared/services/proj.service';
import { ProjTableComponent } from '@dashboard/proj/proj-table/proj-table.component';

@Component({
  selector: 'app-proj-list-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ProjTableComponent],
  templateUrl: './proj-list-page.component.html',
})
export class ProjListPageComponent implements OnInit {

  private projService = inject(ProjService);

  projs: Proj[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadProjs();
  }

  loadProjs() {
    this.loading = true;
    this.projService.getAll().subscribe({
      next: (resp) => {
        this.projs = resp;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar proyectos';
        console.error(err);
        this.loading = false;
      }
    });
  }
}
