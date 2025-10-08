import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ObrasService } from '../../../obras/services/obras.service';
import { ProductCarouselComponent } from '../../../products/components/product-carousel/product-carousel.component';

@Component({
  selector: 'app-product-page',
  // imports: [ProductCarouselComponent],
  templateUrl: './obras-page.component.html',
})
export class ObraPageComponent {
  activatedRoute = inject(ActivatedRoute);
  obrasService = inject(ObrasService);

  productIdSlug = this.activatedRoute.snapshot.params['idSlug'];
  
  productResource = rxResource({
    request: () => ({ idSlug: this.productIdSlug }),
    loader: ({ request }) =>
      this.obrasService.getObras(request.idSlug),
  });
}
