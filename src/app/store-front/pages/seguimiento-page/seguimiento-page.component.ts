import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import mapboxgl, { LngLatLike } from 'mapbox-gl';
import { CommonModule, DecimalPipe, JsonPipe } from '@angular/common';
import { environment } from '../../../../environments/environment';

mapboxgl.accessToken = environment.mapboxKey;

/* =======================
   INTERFACES
======================= */
interface Marker {
  id: string;
  mapboxMarker: mapboxgl.Marker;
}

interface ProgramaPedido {
  order_code: string;
  estado: string;
  prod_descr: string;
  totalM3: number;
  loadedM3: number;
  percent: number;
  hora?: string;
  load_size?: number;
}

/* =======================
   COMPONENT
======================= */
@Component({
  selector: 'app-seguimiento-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seguimiento-page.component.html',
})
export class SeguimientoPageComponent
  implements AfterViewInit, OnInit
{
  constructor(
    private route: ActivatedRoute,
    private router: Router,    
  ) {}

  currentYear = new Date().getFullYear();

  /* =======================
     MAPA
  ======================= */
  divElement = viewChild<ElementRef>('map');
  map = signal<mapboxgl.Map | null>(null);

  zoom = signal(10);
  coordinates = signal({ lng: -70.677771, lat: -33.466227 });
  markers = signal<Marker[]>([]);

  zoomEffect = effect(() => {
    if (this.map()) {
      this.map()!.setZoom(this.zoom());
    }
  });

  /* =======================
     DATA PEDIDO
  ======================= */
  programaPedido = signal<ProgramaPedido[]>([]);

  /* =======================
     LIFECYCLE
  ======================= */
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const code = params['code'];
      if (code) {
        this.loadSeguimiento(code.trim());
      }
    });
  }

  goBack() {
    this.router.navigate(['/store-front']);
  }

  async ngAfterViewInit() {
    if (!this.divElement()?.nativeElement) return;

    await new Promise((r) => setTimeout(r, 50));

    const map = new mapboxgl.Map({
      container: this.divElement()!.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-70.677771, -33.466227],
      zoom: 10,
    });

    this.mapListeners(map);
  }

  /* =======================
     MAP EVENTS
  ======================= */
  mapListeners(map: mapboxgl.Map) {
    this.map.set(map);

    map.on('load', () => {
      map.on('zoomend', () => {
        this.zoom.set(map.getZoom());
      });

      map.on('moveend', () => {
        const center = map.getCenter();
        this.coordinates.set(center);
      });

      map.addControl(new mapboxgl.NavigationControl());
      map.addControl(new mapboxgl.FullscreenControl());
      map.addControl(new mapboxgl.ScaleControl());
    });
  }

  flyToMarker(lngLat: LngLatLike) {
    this.map()?.flyTo({ center: lngLat, zoom: 14 });
  }

  /* =======================
     DATA MOCK / API
  ======================= */
  loadSeguimiento(code: string) {
    // 🔴 AQUÍ normalmente llamas a tu servicio HTTP
    // 👉 por ahora mockeamos datos reales

    const data: ProgramaPedido = {
      order_code: code,
      estado: 'EN TRANSITO',
      prod_descr: 'SHG30-90%-10 C/24 AC045 MS5.0',
      totalM3: 41,
      loadedM3: 26,
      percent: Math.round((26 / 41) * 100),
    };

    this.programaPedido.set([data]);
  }

  /* =======================
     ACTIONS
  ======================= */
  goToSeguimiento(orderCode: string) {
    this.router.navigate(['/store-front/seguimiento'], {
      queryParams: { code: orderCode },
    });
  }
}
