import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import mapboxgl, { LngLatLike } from 'mapbox-gl';
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

  ngOnInit() {
    if (!this.ord) return;

    this.programaPedido.set([
      {
        order_code: this.ord.order_code,
        estado: this.ord.estado,
        prod_descr: this.ord.prod_descr ?? '—',
        load_size: this.ord.load_size ?? this.ord.order_qty,
        hora: this.ord.start_time,
      },
    ]);
  }

  async ngAfterViewInit() {
    if (!this.divElement()?.nativeElement) return;

    await new Promise(r => setTimeout(r, 50));

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
    el.style.backgroundImage = `url('assets/images/obra.png')`;
    el.style.width = '40px';
    el.style.height = '40px';
    el.style.backgroundSize = 'contain';

    new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([lng, lat])
      .addTo(this.map()!);
  }

  get estadoActual(): string {
    const estado = this.programaPedido()[0]?.estado?.trim()?.toUpperCase();

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

  onClose() {
    this.close.emit();
  }
}
