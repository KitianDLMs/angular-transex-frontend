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
  today = new Date();
  horas = ['8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];

  obras = [
    {
      name: 'Edificio Central Plaza',
      location: 'Santiago, Chile',
      estado: 'En curso',
      responsable: 'Carlos Méndez',
      progreso: 65,
      programacion: [
        {
          dia: 'MARTES 01/10',
          inicio: '01:00',
          m3: 394,
          bloques: [
            { nombre: 'SH300901020', inicio: 10, duracion: 15, color: '#F97316', m3: 52.5 },
            { nombre: 'FLUIDO G 25902018', inicio: 35, duracion: 10, color: '#7C2D12', m3: 166 },
            { nombre: 'GB300902010', inicio: 70, duracion: 10, color: '#0284C7', m3: 31 },
          ],
        },
        {
          dia: 'MIÉRCOLES 02/10',
          inicio: '10:00',
          m3: 251.5,
          bloques: [
            { nombre: 'SH300901020', inicio: 20, duracion: 10, color: '#F97316', m3: 52.5 },
            { nombre: 'FLUIDO G 25902018', inicio: 45, duracion: 10, color: '#7C2D12', m3: 166 },
          ],
        },
      ].map((prog) => ({ ...prog, abierto: false })),
    },
    {
      name: 'Puente Río Claro',
      location: 'Talca, Chile',
      estado: 'Finalizada',
      responsable: 'Rodrigo Salinas',
      progreso: 100,
      programacion: [
        {
          dia: 'JUEVES 03/10',
          inicio: '07:00',
          m3: 831.5,
          bloques: [
            { nombre: 'GR050902008', inicio: 25, duracion: 15, color: '#0EA5E9', m3: 200 },
            { nombre: 'FLUIDO G 25902018', inicio: 55, duracion: 10, color: '#7C2D12', m3: 631.5 },
          ],
        },
      ].map((prog) => ({ ...prog, abierto: false })),
    },
    {
      name: 'Centro Cultural San Pedro',
      location: 'San Pedro, Chile',
      estado: 'En curso',
      responsable: 'Juan Pérez',
      progreso: 70,
      programacion: [
        {
          dia: 'VIERNES 04/10',
          inicio: '08:00',
          m3: 410,
          bloques: [
            { nombre: 'CC300904010', inicio: 15, duracion: 20, color: '#2563EB', m3: 150 },
            { nombre: 'FLUIDO H 27002010', inicio: 50, duracion: 15, color: '#059669', m3: 260 },
          ],
        },
      ].map((prog) => ({ ...prog, abierto: false })),
    },
    {
      name: 'Plaza Los Álamos',
      location: 'Curicó, Chile',
      estado: 'Retrasada',
      responsable: 'María Soto',
      progreso: 50,
      programacion: [
        {
          dia: 'SÁBADO 05/10',
          inicio: '09:00',
          m3: 300,
          bloques: [
            { nombre: 'AL050905001', inicio: 20, duracion: 25, color: '#EAB308', m3: 120 },
            { nombre: 'FLUIDO G 25902018', inicio: 60, duracion: 10, color: '#7C2D12', m3: 180 },
          ],
        },
      ].map((prog) => ({ ...prog, abierto: false })),
    },
    {
      name: 'Puente Huertos',
      location: 'San Bernardo, Chile',
      estado: 'Completada',
      responsable: 'Luis Díaz',
      progreso: 100,
      programacion: [
        {
          dia: 'LUNES 07/10',
          inicio: '07:00',
          m3: 510,
          bloques: [
            { nombre: 'PH070907002', inicio: 30, duracion: 20, color: '#4F46E5', m3: 200 },
            { nombre: 'FLUIDO G 25902018', inicio: 60, duracion: 15, color: '#7C2D12', m3: 310 },
          ],
        },
      ].map((prog) => ({ ...prog, abierto: false })),
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
