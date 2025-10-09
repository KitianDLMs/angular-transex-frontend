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

  horas = ['8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];

  obras = [
    {
      dia: 'LUNES 23/09',
      inicio: '10:00',
      m3: 295.5,
      bloques: [
        {
          nombre: 'SH300901020 AVO',
          inicio: 5, // porcentaje del contenedor
          duracion: 35,
          color: '#007EA7',
          m3: 67.5,
        },
        {
          nombre: 'FLUIDO G 25902018 AVO',
          inicio: 45,
          duracion: 45,
          color: '#00B4D8',
          m3: 228,
        },
      ],
    },
    {
      dia: 'LUNES 23/09',
      inicio: '12:20',
      m3: 12.5,
      bloques: [
        {
          nombre: 'SH300901020 AVO',
          inicio: 1, // porcentaje del contenedor
          duracion: 12,
          color: '#007EA7',
          m3: 23.5,
        },
        {
          nombre: 'FLUIDO Z 1202100 AVO',
          inicio: 45,
          duracion: 45,
          color: '#00B4D8',
          m3: 212,
        },
      ],
    },
    {
      dia: 'VIERNES 10/19',
      inicio: '15:00',
      m3: 200.5,
      bloques: [
        {
          nombre: 'SH300901020 AVO',
          inicio: 1,
          duracion: 12,
          color: '#007EA7',
          m3: 23.5,
        },
        {
          nombre: 'FLUIDO Z 1202100 AVO',
          inicio: 45,
          duracion: 45,
          color: '#00B4D8',
          m3: 212,
        },
      ],
    },
  ];

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
