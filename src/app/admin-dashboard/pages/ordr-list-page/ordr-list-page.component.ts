import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Ordr } from 'src/app/ordr/interfaces/ordr.interface';
import { OrdrTableComponent } from 'src/app/ordr/components/ordr-table/ordr-table.component';
import { OrdrService } from '@shared/services/ordr.service';

@Component({
  selector: 'app-ordr-list-page',
  standalone: true,
  imports: [CommonModule, RouterModule, OrdrTableComponent],
  templateUrl: './ordr-list-page.component.html',
})
export class OrdrListPageComponent implements OnInit {

  private ordrService = inject(OrdrService);

  orders: Ordr[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;

    this.ordrService.getAllOrdrs().subscribe({
      next: (resp) => {
        this.orders = resp;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar órdenes';
        console.error(err);
        this.loading = false;
      }
    });
  }
}
