import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal,
  viewChild,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import mapboxgl from 'mapbox-gl';
import { environment } from 'src/environments/environment.development';

mapboxgl.accessToken = environment.mapboxKey;

@Component({
  selector: 'app-seguimiento-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seguimiento-sheet.component.html',
})
export class SeguimientoOverlayComponent
  implements OnInit, AfterViewInit
{
  @Input() ord!: any;
  @Output() close = new EventEmitter<void>();

  divElement = viewChild<ElementRef>('map');
  map = signal<mapboxgl.Map | null>(null);

  programaPedido = signal<any[]>([]);

  programado: any[] = [];
  enTransito: any[] = [];
  completado: any[] = [];

  ngOnInit() {
    if (!this.ord?.detalles) return;

    console.log(this.ord);

    this.programado = this.ord.detalles.filter(
      (d: any) => d.estado === 'PROGRAMADO'
    );

    this.enTransito = this.ord.detalles.filter(
      (d: any) => d.estado === 'EN_TRANSITO'
    );

    this.completado = this.ord.detalles.filter(
      (d: any) => d.estado === 'COMPLETADO'
    );
  }

  async ngAfterViewInit() {
    if (!this.divElement()?.nativeElement) return;

    await new Promise((r) => setTimeout(r, 50));

    const map = new mapboxgl.Map({
      container: this.divElement()!.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [
        Number(this.ord.longitud),
        Number(this.ord.latitud),
      ],
      zoom: 10,
    });

    this.map.set(map);

    map.on('load', () => {
      map.addControl(new mapboxgl.NavigationControl());

      if (this.ord?.latitud && this.ord?.longitud) {
        this.addMarker(
          Number(this.ord.latitud),
          Number(this.ord.longitud)
        );
      }
    });
  }

  addMarker(lat: number, lng: number) {
    if (!this.map()) return;

    const el = document.createElement('div');
    el.style.backgroundImage = "url('assets/images/obra.png')";
    el.style.width = '40px';
    el.style.height = '40px';
    el.style.backgroundSize = 'contain';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat([lng, lat])
      .addTo(this.map()!);
  }

  get estadoActual(): string {
    const estado = this.programaPedido()[0]?.estado
      ?.trim()
      ?.toUpperCase();

    switch (estado) {
      case 'POR CONFIRMAR':
        return 'PROGRAMADO';
      case 'CARGANDO':
        return 'CARGANDO';
      case 'EN TRANSITO':
        return 'EN TRANSITO';
      case 'EN OBRA':
        return 'EN OBRA';
      case 'NORMAL':
        return 'COMPLETADO';
      default:
        return 'DESCONOCIDO';
    }
  }

  get filasCompletadas() {
    if (this.ord?.estado?.trim().toUpperCase() !== 'NORMAL') {
      return [];
    }

    return (this.ord.start_times || []).map(
      (hora: string) => ({
        guia: '—',
        camion: '—',
        cantidad: this.ord.load_size,
        hora_fin: hora,
      })
    );
  }

  get filasEnTransito() {
    const estado = this.ord?.estado?.trim().toUpperCase();
    if (estado === 'NORMAL') return [];

    const ultimaHora =
      this.ord?.start_times?.[
        this.ord.start_times.length - 1
      ];

    if (!ultimaHora) return [];

    return [
      {
        guia: '—',
        camion: '—',
        cantidad: this.ord.load_size,
        hora_obra: ultimaHora,
      },
    ];
  }

  onClose() {
    this.close.emit();
  }
}
