// import { Component, inject } from '@angular/core';
// import { rxResource } from '@angular/core/rxjs-interop';
// import { ActivatedRoute } from '@angular/router';
// import { ProductsService } from '@products/services/products.service';
// import { TickService } from 'src/app/tick/services/tick.service';
// import { ProductCarouselComponent } from '../../../products/components/product-carousel/product-carousel.component';

// @Component({
//   selector: 'app-product-page',
//   imports: [ProductCarouselComponent],
//   templateUrl: './product-page.component.html',
// })
// export class ProductPageComponent {

//   activatedRoute = inject(ActivatedRoute);
//   productService = inject(ProductsService);
//   tickService = inject(TickService);

//   productIdSlug = this.activatedRoute.snapshot.params['idSlug'];

//   // 🔹 Datos del producto
//   productResource = rxResource({
//     request: () => ({ idSlug: this.productIdSlug }),
//     loader: ({ request }) =>
//       this.productService.getProductByIdSlug(request.idSlug),
//   });

//   // 🔹 Tickets (offset 0, limit 100 por ejemplo)
//   tickResource = rxResource({
//     request: () => ({ offset: 0, limit: 100 }),
//     loader: ({ request }) =>
//       this.tickService.getTicks({
//         offset: request.offset,
//         limit: request.limit,
//       }),
//   });

// }
