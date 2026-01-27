import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pedidos-actuales',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './pedidos-futuros.component.html',
})
export class PedidosFuturosComponent implements OnInit {

  projectName: string = '';
  selectedDate: Date = new Date();
  orders: any[] = [];
  today = new Date();
  currentYear = new Date().getFullYear();

  constructor(
    private router: Router
  ) {}

  ngOnInit(): void {
    // ⚠️ mock temporal para que el template funcione
    this.orders = [
      {
        order_code: '5014',        
        order_Date: '2026-01-26',
        prod_descr: 'SHG30-90%-10 C/24 AC045 MS5.0',
        load_size: 41,
        delivered: 20,
        start_time: '14:30',
        estado: 'Normal',
        percent: 48,
        project_name: 'Estructuras - Tunel lo Ruiz',
        project_address: 'Tunel lo Ruiz',
        total: 8
      },
      {
        order_code: '5016',
        order_Date: '2026-01-26',
        prod_descr: 'SHG30-90%-10 C/24 AC045 MS5.0',
        load_size: 49,
        delivered: 0,
        start_time: '15:35',
        estado: 'Por Confirmar',
        percent: 0,
        project_name: 'Estructuras - Tunel lo Ruiz',
        project_address: 'Tunel lo Ruiz',
        total: 5
      }
    ];
  }

  goToSeguimiento(ord: any) {
    this.router.navigate(
      ['/store-front/seguimiento'],
      { queryParams: { code: ord.order_code } }
    );
  }
}
