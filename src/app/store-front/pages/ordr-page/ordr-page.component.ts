import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { OrdrService } from '@shared/services/ordr.service';

@Component({
  selector: 'app-ordr-page',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './ordr-page.component.html',
})
export class OrdrPageComponent {
  private ordrService = inject(OrdrService);

  today = new Date();
  currentYear = new Date().getFullYear();

  ordrResource = rxResource({
    request: () => null,
    loader: () => this.ordrService.getAllOrdrs(),
  });
}
