import { Component, inject, effect, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TickService } from '@products/services/tick.service';

@Component({
  selector: 'app-ticks-admin-page',
  imports: [RouterLink],
  templateUrl: './ticks-admin-page.component.html',
})
export class TicksAdminPageComponent {

  tickService = inject(TickService);

  ticksPerPage = signal(10);

  ticksResource = rxResource({
    loader: () => this.tickService.getTicks()
  });

  constructor() {
    effect(() => {
      const data = this.ticksResource.value();
      if (!data) return;

      console.log("📌 Datos recibidos desde backend:", data);
      console.log("📌 Lista de ticks:", data.ticks);
    });
  }
}

