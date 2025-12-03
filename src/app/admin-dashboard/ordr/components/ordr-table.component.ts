import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Ordr } from '@dashboard/ordr/interfaces/ordr.interface';

@Component({
  selector: 'ordr-table',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ordr-table.component.html',
})
export class OrdrTableComponent {

  private _orders: Ordr[] | null = null;

  @Input() set orders(value: Ordr[] | null) {
    this._orders = value;

    if (value) {
      console.log('Órdenes recibidas:', value);

      value.forEach((ordr) => {
        console.log('order_date =>', ordr.order_date);
      });
    }
  }

  get orders() {
    return this._orders;
  }

  @Input() loading = false;

  constructor(private router: Router) {
    console.log('OrdrTableComponent inicializado');
  }

  formatDateForRoute(date: any): string {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    
    return d.toISOString().split('T')[0];
  }


  formatDate(date: any): string {
    return new Date(date).toISOString().split('T')[0];
  }

  trackByOrder(_: number, ordr: Ordr) {
    return ordr.order_code;
  }

  editar(date: any, code: any) {
    const dateClean = this.formatDateForRoute(date);
    const codeClean = code.trim();

    console.log('navigate →', dateClean, codeClean);

    this.router.navigate([
      '/admin/ordr/edit',
      dateClean,
      codeClean
    ]);
}


}
