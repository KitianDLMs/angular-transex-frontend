import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '@products/interfaces/product.interface';
import { ProductImagePipe } from '@products/pipes/product-image.pipe';

@Component({
  selector: 'obra-table',
  imports: [ProductImagePipe, RouterLink, CurrencyPipe],
  templateUrl: './obra-table.component.html',
})
export class ProductTableComponent {
  products = input.required<Product[]>();
}
