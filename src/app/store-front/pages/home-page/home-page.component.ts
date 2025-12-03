import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { PaginationService } from '@shared/components/pagination/pagination.service';
import { catchError, tap } from 'rxjs';
import { ProjService } from '@shared/services/proj.service';


@Component({
  selector: 'app-home-page',
  imports: [CurrencyPipe, DatePipe, CommonModule],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {

  projService = inject(ProjService);
  paginationService = inject(PaginationService);

  today = new Date();
  currentYear = new Date().getFullYear();

  projResource = rxResource({
    request: () => ({ page: this.paginationService.currentPage() - 1 }),
    loader: ({ request }) => {
      return this.projService.getAll().pipe(
        tap(resp => console.log('📌 Proyectos cargados:', resp)),
        catchError(err => {
          console.error('❌ Error cargando proyectos:', err);
          throw err;
        })
      );
    },
  });

  onEdit(proj: any) {}

  onDelete(proj: any) {}
}
