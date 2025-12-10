import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import mapboxgl, { LngLatLike } from 'mapbox-gl'; // or "const mapboxgl = require('mapbox-gl');"
import { DecimalPipe, JsonPipe } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { v4 as UUIDv4 } from 'uuid';
import { ActivatedRoute } from '@angular/router';

mapboxgl.accessToken = environment.mapboxKey;

interface Marker {
  id: string;
  mapboxMarker: mapboxgl.Marker;
}

@Component({
  selector: 'app-product-page',
  imports: [DecimalPipe, JsonPipe],
  templateUrl: './seguimiento-page.component.html',
})
export class SeguimientoPageComponent implements AfterViewInit, OnInit {

  constructor(private route: ActivatedRoute) {}
  currentYear = new Date().getFullYear();

  divElement = viewChild<ElementRef>('map');
    map = signal<mapboxgl.Map | null>(null);
    markers = signal<Marker[]>([]);
    zoom = signal(10);
    coordinates = signal({
      lng: -74.5,
      lat: 40,
    });

  zoomEffect = effect(() => {
    if (!this.map()) return;

    this.map()?.setZoom(this.zoom());
  });

  async ngAfterViewInit() {
    if (!this.divElement()?.nativeElement) return;

    await new Promise((resolve) => setTimeout(resolve, 80));

    const element = this.divElement()!.nativeElement;

    const map = new mapboxgl.Map({
      container: element,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-70.677771, -33.466227],       
      zoom: 10,
    });

    // const marker = new mapboxgl.Marker({
    //   draggable: false,
    //   color: '#000',
    // })
    //   .setLngLat([-122.40985, 37.793085])
    //   .addTo(map);

    // marker.on('dragend', (event) => {
    //   console.log(event);
    // });

    this.mapListeners(map);
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      console.log("➡ Código recibido:", code);

      if (code) {
        // this.loadSeguimiento(code);
      }
    });
  }

  mapListeners(map: mapboxgl.Map) {
  this.map.set(map);

  map.on('load', () => {
    console.log('Map loaded ✅');

    map.on('click', (event) => this.mapClick(event));

    map.on('zoomend', (event) => {
      const newZoom = event.target.getZoom();
      this.zoom.set(newZoom);
    });

    map.on('moveend', () => {
      const center = map.getCenter();
      this.coordinates.set(center);
    });

    map.addControl(new mapboxgl.FullscreenControl());
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(new mapboxgl.ScaleControl());
  });
}

mapClick(event: mapboxgl.MapMouseEvent) {
  if (!this.map()) return;

  const map = this.map()!;
  const coords = event.lngLat;
  const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

  const mapboxMarker = new mapboxgl.Marker({ color })
    .setLngLat(coords)
    .addTo(map);

  const newMarker: Marker = {
    id: UUIDv4(),
    mapboxMarker,
  };

  this.markers.update((markers) => [newMarker, ...markers]);
  console.log('Nuevo marcador agregado 🟢', coords);
}

  flyToMarker(lngLat: LngLatLike) {
    if (!this.map()) return;

    this.map()?.flyTo({
      center: lngLat,
    });
  }

  deleteMarker(marker: Marker) {
    if (!this.map()) return;
    const map = this.map()!;

    marker.mapboxMarker.remove();

    this.markers.set(this.markers().filter((m) => m.id !== marker.id));
  }
}