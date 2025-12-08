import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProdService } from '@shared/services/prod.service';
import { Imst } from '@dashboard/imst/interfaces/imst.interface';
import { ImstTableComponent } from '@dashboard/imst/components/imst-table.component';


@Component({
  selector: 'app-prod-list-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ImstTableComponent],
  templateUrl: './imst-list-page.component.html',
})
export class ImstListPageComponent implements OnInit {

  private prodService = inject(ProdService);

  products: Imst[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;

    this.prodService.getAll().subscribe({
      next: (resp) => {
        this.products = resp;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar productos';
        console.error(err);
        this.loading = false;
      }
    });
  }
}
