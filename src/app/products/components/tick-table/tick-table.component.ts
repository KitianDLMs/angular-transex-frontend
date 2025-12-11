import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '@products/interfaces/product.interface';
import { ProductImagePipe } from '@products/pipes/product-image.pipe';

@Component({
  selector: 'tick-table',
  templateUrl: './tick-table.component.html'
})
export class TickTableComponent {
  ticks = input.required<any[]>();
}
