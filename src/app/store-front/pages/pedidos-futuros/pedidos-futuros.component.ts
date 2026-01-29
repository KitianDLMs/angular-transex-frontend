import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { OrdrService } from '@shared/services/ordr.service';

@Component({
  selector: 'app-pedidos-futuros',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './pedidos-futuros.component.html',
  providers: [DatePipe]
})
export class PedidosFuturosComponent implements OnInit {

  orders: any[] = [];
  today = new Date();
  currentUser: any = null;
  loading = false;
  selectedDate!: Date;
  ordBase: any = null;

  authService = inject(AuthService);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ordrService: OrdrService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.user();
    this.ordBase = history.state?.ord ?? null;    
    this.route.queryParams.subscribe(params => {
      const rawCode = params['code'];
      if (!rawCode) return;

      const order_code = rawCode.trim();
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const order_date = this.datePipe.transform(futureDate, 'yyyy-MM-dd');
      if (!order_date) return;

      this.loading = true;
      this.orders = [];      
      this.ordrService
        .getProgramaPorPedido(order_code, order_date)
        .subscribe({
          next: (response: any[]) => {                               
            this.orders = response;
            this.loading = false;
          },
          error: err => {
            console.error(err);
            this.loading = false;
          }
        });
    });
  }

  goToSeguimiento(ord: any) {
    this.router.navigate(
      ['/store-front/seguimiento'],
      { queryParams: { code: ord.order_code } }
    );
  }
}
