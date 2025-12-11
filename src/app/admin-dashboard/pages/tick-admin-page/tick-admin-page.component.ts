import { Component, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';

import { TickDetailsComponent } from './tick-details/tick-details.component';
import { TickService } from '@products/services/tick.service';

@Component({
  selector: 'app-tick-admin-page',
  imports: [TickDetailsComponent],
  templateUrl: './tick-admin-page.component.html',
})
export class TickAdminPageComponent {

  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  tickService = inject(TickService);

  params = toSignal(
    this.activatedRoute.params.pipe(
      map(params => ({
        order_date: params['order_date'],
        order_code: params['order_code'],
        tkt_code: params['tkt_code']
      }))
    )
  );

  tickResource = rxResource({
    request: () => this.params(),
    loader: ({ request }) => {
      return this.tickService.getOne(
        request!.order_date,
        request!.order_code,
        request!.tkt_code
      );
    },
  });

  redirectEffect = effect(() => {
    if (this.tickResource.error()) {
      this.router.navigate(['/admin/ticks']);
    }
  });
}
