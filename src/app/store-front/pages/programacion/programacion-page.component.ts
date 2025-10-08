import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ObrasService } from '../../../obras/services/obras.service';
import { ProductCarouselComponent } from '../../../products/components/product-carousel/product-carousel.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-page',
  imports: [CommonModule],
  templateUrl: './programacion-page.component.html',
})
export class ProgramacionPageComponent {

  programacion = [
    {
      obra: 'Centro Cultural San Pedro',
      actividad: 'Excavación y movimiento de tierra',
      responsable: 'Juan Pérez',
      inicio: '01/10/2025',
      fin: '05/10/2025',
      avance: 70,
      estado: 'En curso',
    },
    {
      obra: 'Plaza Los Álamos',
      actividad: 'Fundaciones y radier',
      responsable: 'María Soto',
      inicio: '03/10/2025',
      fin: '10/10/2025',
      avance: 50,
      estado: 'Retrasado',
    },
    {
      obra: 'Puente Huertos',
      actividad: 'Terminaciones finales',
      responsable: 'Luis Díaz',
      inicio: '25/09/2025',
      fin: '09/10/2025',
      avance: 100,
      estado: 'Completado',
    },
  ];

  activatedRoute = inject(ActivatedRoute);
  obrasService = inject(ObrasService);

  productIdSlug = this.activatedRoute.snapshot.params['idSlug'];
  
  productResource = rxResource({
    request: () => ({ idSlug: this.productIdSlug }),
    loader: ({ request }) =>
      this.obrasService.getObras(request.idSlug),
  });

  getColor(avance: number): string {
    if (avance < 50) return '#fbbf24'; // amarillo
    if (avance < 100) return '#22c55e'; // verde
    return '#3b82f6'; // azul
  }
}
