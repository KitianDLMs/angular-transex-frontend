import { Component, computed, input } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '@products/interfaces/product.interface';
import { ProductImagePipe } from '@products/pipes/product-image.pipe';

@Component({
  selector: 'obra-card',
  imports: [RouterLink, SlicePipe, ProductImagePipe],
  templateUrl: './proj-card.component.html',
})
export class ProductCardComponent {
  product = input.required<Product>();

  imageUrl = computed(() => {
    return `http://localhost:3000/api/files/obra/${
      this.product().images[0]
    }`;
  });
}
