import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Ordr } from 'src/app/ordr/interfaces/ordr.interface';
import { OrdrService } from '@shared/services/ordr.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-ordr-table',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ordr-table.component.html',
})
export class OrdrTableComponent implements OnInit {
formatDate(arg0: string|undefined): any|string {
throw new Error('Method not implemented.');
}

  @Input() orders: Ordr[] | null = null;

  private ordrService = inject(OrdrService);

  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadOrders();
  }

  constructor(private router: Router) { }

  private loadOrders() {
    this.loading.set(true);
    this.error.set(null);

    this.ordrService.getAllOrdrs().subscribe({
      next: (list) => {
        // this.orders!.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las órdenes');
        this.loading.set(false);
      }
    });
  }

  editar(code: any) {
      const codeClean = code.trim();

      console.log('navigate →', codeClean);

      this.router.navigate([
        '/admin/ordr/edit',
        codeClean
      ]);
  }

  formatDateForRoute(date: any): string {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';

    // Siempre devolver solo AAAA-MM-DD
    return d.toISOString().split('T')[0];
  }

}
