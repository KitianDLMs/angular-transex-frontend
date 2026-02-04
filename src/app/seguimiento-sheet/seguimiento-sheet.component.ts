import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
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
  implements AfterViewInit {

  @Input() ord!: any;
  @Output() close = new EventEmitter<void>();

  divMap = viewChild<ElementRef>('map');
  map = signal<mapboxgl.Map | null>(null);

  // ------------------------
  // CONTROL DE ABANICOS
  // ------------------------
  accordion: Record<string, boolean> = {
    programado: false,
    impreso: false,
    transito: false,
    obra: false,
    completado: false,
  };

  toggle(key: keyof typeof this.accordion) {
    console.log(key);
    console.log(this.accordion);    
    this.accordion[key] = !this.accordion[key];
  }

  ngAfterViewInit() {
    if (!this.divMap()?.nativeElement) return;

    const map = new mapboxgl.Map({
      container: this.divMap()!.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [this.ord.longitud, this.ord.latitud],
      zoom: 14,
    });

    map.addControl(new mapboxgl.NavigationControl());
    this.map.set(map);

    this.addMarker(this.ord.latitud, this.ord.longitud);
  }

  addMarker(lat: number, lng: number) {
    if (!this.map()) return;

    const el = document.createElement('div');
    el.style.backgroundImage = "url('assets/images/obra.png')";
    el.style.width = '40px';
    el.style.height = '40px';
    el.style.backgroundSize = 'contain';

    new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([lng, lat])
      .addTo(this.map()!);
  }

  // ------------------------
  // HELPERS
  // ------------------------

  get m3Total() {
    return this.ord.order_qty;
  }

  get m3PorCamion() {
    return this.ord.load_size;
  }

  get completado() {
    return (this.ord.start_times || []).map((h: string, i: number) => ({
      guia: '—',
      camion: '—',
      cantidad: this.m3PorCamion,
      hora: h,
    }));
  }

  get m3Completado() {
    return this.completado.length * this.m3PorCamion;
  }

  onClose() {
    this.close.emit();
  }
}
