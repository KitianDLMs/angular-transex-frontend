import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { PaginationService } from '@shared/components/pagination/pagination.service';
import { RouterLink } from '@angular/router';
import { TickService } from '@products/services/tick.service';

@Component({
  selector: 'app-ticks-admin-page',
  imports: [RouterLink],
  templateUrl: './ticks-admin-page.component.html',
})
export class TicksAdminPageComponent {

  tickService = inject(TickService);
  paginationService = inject(PaginationService);

  ticksPerPage = signal(10);

  ticksResource = rxResource({
    request: () => ({
      page: this.paginationService.currentPage() - 1,
      limit: this.ticksPerPage(),
    }),
    loader: () => {
      return this.tickService.getTicks();
    },
  });

}
