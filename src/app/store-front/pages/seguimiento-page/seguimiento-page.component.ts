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
import { Location } from '@angular/common';

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
    private location: Location  
  ) {}

  currentYear = new Date().getFullYear();

  /* =======================
     MAPA
  ======================= */
  divElement = viewChild<ElementRef>('map');
  map = signal<mapboxgl.Map | null>(null);
  ord: any; 

  zoom = signal(10);
  coordinates = signal({ lng: -70.677771, lat: -33.466227 });
  markers = signal<Marker[]>([]);

  zoomEffect = effect(() => {
    if (this.map()) {
      this.map()!.setZoom(this.zoom());
    }
  });
  programaPedido = signal<ProgramaPedido[]>([]);  

  ngOnInit(): void {
    if (history.state && history.state.ord) {
      this.ord = history.state.ord;

      const data: ProgramaPedido = {
        order_code: this.ord.order_code,
        estado: this.ord.estado,
        prod_descr: this.ord.prod_descr ?? '—',
        totalM3: this.ord.totalM3 ?? this.ord.order_qty ?? 0,
        loadedM3: this.ord.delv_qty ?? this.ord.load_size ?? 0,
        percent: this.ord.order_qty
          ? Math.round((this.ord.delv_qty / this.ord.order_qty) * 100)
          : 0,
        hora: this.ord.start_time,
        load_size: this.ord.load_size,
      };

      this.programaPedido.set([data]);
    }

    const orderCode = this.route.snapshot.queryParamMap.get('code');
    console.log('Order Code:', orderCode);
  }

  goBack() {
    this.location.back();
  }

  async ngAfterViewInit() {
    if (!this.divElement()?.nativeElement) return;

    await new Promise((r) => setTimeout(r, 50));

    const map = new mapboxgl.Map({
      container: this.divElement()!.nativeElement,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-70.677771, -33.466227],
      zoom: 14,
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

      // map.on('moveend', () => {
      //   const center = map.getCenter();
      //   this.coordinates.set(center);
      // });

      map.addControl(new mapboxgl.NavigationControl());
      map.addControl(new mapboxgl.FullscreenControl());
      map.addControl(new mapboxgl.ScaleControl());

      // 🔥 AQUÍ agregamos el marcador
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
    el.style.backgroundRepeat = 'no-repeat';
    el.style.cursor = 'pointer';

    const marker = new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat([lng, lat])
      .addTo(this.map()!);

    this.markers.update(m => [
      ...m,
      { id: 'pedido', mapboxMarker: marker },
    ]);

    this.map()!.flyTo({
      center: [lng, lat],
      // zoom: 14,
    });
  }

  get estadoActual(): string {
    const estadoBackend = this.programaPedido()[0]?.estado;
    return this.getEstadoUI(estadoBackend);
  }

  getEstadoUI(estadoBackend: string): string {
    const estado = estadoBackend?.trim().toUpperCase();

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
