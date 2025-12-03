// import { Component, inject, signal } from '@angular/core';
// import { rxResource } from '@angular/core/rxjs-interop';
// import { ProductsService } from '@products/services/products.service';
// import { PaginationService } from '@shared/components/pagination/pagination.service';

// import { ProductTableComponent } from '../../../products/components/product-table/product-table.component';
// import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
// import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
// import { ObrasService } from 'src/app/obras/services/obras.service';
// import { Obra } from 'src/app/obras/interfaces/obra.interface';

// @Component({  
//   selector: 'app-products-admin-page',
//   imports: [RouterModule, ObraTableComponent, PaginationComponent, RouterLink],
//   templateUrl: './obras-admin-page.component.html',
// })
// export class ObrasAdminPageComponent {
//   paginationService = inject(PaginationService);
//   obrasPerPage = signal(10);
//   activatedRoute = inject(ActivatedRoute);
//   obrasService = inject(ObrasService);
//   router = inject(Router);

//   obras = signal<Obra[]>([]);

//   // constructor() {
//   //   this.obrasService.getObras({ offset: 0, limit: 10 }).subscribe(res => {
//   //     this.obras.set(res);
//   //   });
//   // }
  
//   productIdSlug = this.activatedRoute.snapshot.params['idSlug'];

//   obrasResource = rxResource({
//     request: () => ({
//       page: this.paginationService.currentPage() - 1,
//       limit: this.obrasPerPage(),
//     }),
//     loader: ({ request }) => {
//       return this.obrasService.getObras({
//         offset: request.page * 9,
//         limit: request.limit,
//       });
//     },
//   });
// }
