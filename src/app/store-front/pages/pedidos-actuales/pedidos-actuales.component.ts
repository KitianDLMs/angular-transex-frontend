import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';
import { OrdrService } from '@shared/services/ordr.service';

@Component({
  selector: 'app-pedidos-actuales',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './pedidos-actuales.component.html',
  providers: [DatePipe]
})
export class PedidosActualesComponent implements OnInit {

  programaPedido: any[] = [];
  today = new Date();
  currentYear = new Date().getFullYear();
  currentUser: any = null;
  ordBase: any = null;

  authService = inject(AuthService);
  loading = false;

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
      const order_date = this.datePipe.transform(this.today, 'yyyy-MM-dd');
      if (!order_date) return;

      this.loading = true;
      this.programaPedido = [];

      this.ordrService
        .getProgramaPorPedido(order_code, order_date)
        .subscribe({
          next: (response: any[]) => {                        
            const totalM3 = response.reduce(
              (sum, r) => sum + Number(r.load_size ?? 0),
              0
            );            
            const loadedM3 = response
              .filter(r => r.estado === 'TERMINADO')
              .reduce((sum, r) => sum + Number(r.load_size ?? 0), 0);

            const percent = totalM3 > 0
              ? Math.round((loadedM3 / totalM3) * 100)
              : 0;            
            this.programaPedido = response.map(ord => ({                          
              ...ord,
              loadedM3,
              totalM3,
              percent
            }));                        
            this.loading = false;
          },
          error: err => {
            console.error(err);
            this.loading = false;
          }
        });
    });
  }

  goToSeguimiento(order_code: string) {
    this.router.navigate(
      ['/store-front/seguimiento'],
      { queryParams: { code: order_code } }
    );
  }
}
