// import { Component, effect, inject, signal } from '@angular/core';
// import { rxResource } from '@angular/core/rxjs-interop';
// import { ProductsService } from '@products/services/products.service';
// import { PaginationService } from '@shared/components/pagination/pagination.service';

// import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
// import { ActivatedRoute, Router, RouterLink } from '@angular/router';
// import { ObrasService } from 'src/app/obras/services/obras.service';
// import { RouterModule } from '@angular/router';

// @Component({
//   selector: 'app-obra-admin-page',
//   imports: [RouterModule, PaginationComponent, RouterLink],
//   templateUrl: './obra-admin-page.component.html',
// })
// export class ObraAdminPageComponent {
//   productsService = inject(ProductsService);
//   paginationService = inject(PaginationService);
  
//   obrasPerPage = signal(10);
  
//   activatedRoute = inject(ActivatedRoute);
//   router = inject(Router);
//   obrasService = inject(ObrasService);
    
//   productId = this.activatedRoute.snapshot.params['id'];

//   productsResource = rxResource({
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

//   redirectEffect = effect(() => {
//       if (this.productsResource.error()) {
//         this.router.navigate(['/admin/obras']);
//       }
//   });
// }
