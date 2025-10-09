import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ProductCardComponent } from '@products/components/product-card/product-card.component';
import { ProductsService } from '@products/services/products.service';
import { CommonModule } from '@angular/common';
import { PaginationService } from '@shared/components/pagination/pagination.service';
import { catchError, tap } from 'rxjs';
import { ObrasService } from 'src/app/obras/services/obras.service';

@Component({
  selector: 'app-home-page',
  imports: [CurrencyPipe, DatePipe, CommonModule],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {
  productsService = inject(ProductsService);
  obrasService = inject(ObrasService);
  paginationService = inject(PaginationService);
  today = new Date();

  // activatedRoute = inject(ActivatedRoute);

  // currentPage = toSignal(
  //   this.activatedRoute.queryParamMap.pipe(
  //     map((params) => (params.get('page') ? +params.get('page')! : 1)),
  //     map((page) => (isNaN(page) ? 1 : page))
  //   ),
  //   {
  //     initialValue: 1,
  //   }
  // );

  productsResource = rxResource({
    request: () => ({ page: this.paginationService.currentPage() - 1 }),
    loader: ({ request }) => {
      return this.productsService.getProducts({
        offset: request.page * 9,
      });
    },
  });

  obrasResource = rxResource({
    request: () => ({ page: this.paginationService.currentPage() - 1 }),
    loader: ({ request }) => {
      return this.obrasService.getObras({
        limit: 9,
        offset: request.page * 9,
      }).pipe(
        tap((resp) => console.log('✅ Obras cargadas:', resp)),
        catchError((error) => {
          console.error('❌ Error al cargar obras:', error);
          throw error;
        })
      );
    },
  });

  onEdit(obra: any) {

  }

  onDelete(obra: any) {

  }
}
