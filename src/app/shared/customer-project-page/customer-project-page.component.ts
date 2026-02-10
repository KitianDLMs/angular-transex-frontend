import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CustomerProjectFilters,
  CustomerProjectFiltersComponent
} from '../customer-project-filters/customer-project-filters.component';

@Component({
  selector: 'app-customer-project-page',
  standalone: true,
  imports: [CommonModule, CustomerProjectFiltersComponent],
  templateUrl: './customer-project-page.component.html',
})
export class CustomerProjectPageComponent {

  onFiltersChange(filters: CustomerProjectFilters) {
    console.log('Filtros recibidos:', filters);
  }
}
