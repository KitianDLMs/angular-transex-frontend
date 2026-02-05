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

interface CamionEstado {
  hora: string;
  estado: string;
  cantidad: number;
}

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

  camiones: CamionEstado[] = [];

  private construirCamiones() {
    this.camiones = (this.ord.start_times || []).map((hora: string) => ({
      hora,
      estado: this.clasificarHora(hora),
      cantidad: this.m3PorCamion,
    }));
  }

  toggle(key: keyof typeof this.accordion) {
    this.accordion[key] = !this.accordion[key];
  }

  ngAfterViewInit() {
    if (!this.divMap()?.nativeElement) return;
    this.verificarStartTimes();
    this.construirCamiones();
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

  private clasificarHora(hora: string): string {
    const ahora = Date.now();
    const fechaHora = this.horaToDate(hora).getTime();
    const diffMin = Math.round((fechaHora - ahora) / 60000);
    const spacing = this.ord.truck_spacing_mins;

    if (diffMin > spacing) return 'PROGRAMADO';

    if (diffMin > 0 && diffMin <= spacing)
      return 'IMPRESO / CARGANDO';

    if (diffMin <= 0 && diffMin > -spacing)
      return 'EN TRANSITO';

    if (diffMin <= -spacing && diffMin > -2 * spacing)
      return 'EN OBRA';

    return 'COMPLETADO';
  }

  verificarStartTimes() {
    this.ord.start_times.forEach((hora: string) => {
      const estado = this.clasificarHora(hora);
    });
  }

  private horaToDate(hora: string): Date {
    const now = new Date();

    const [hours, minutes] = hora.split(':').map(Number);

    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      0,
      0
    );
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

  get programados() {
    return this.camiones.filter(c => c.estado === 'PROGRAMADO');
  }

  get impresos() {
    return this.camiones.filter(c => c.estado === 'IMPRESO / CARGANDO');
  }

  get enTransito() {
    return this.camiones.filter(c => c.estado === 'EN TRANSITO');
  }

  get enObra() {
    return this.camiones.filter(c => c.estado === 'EN OBRA');
  }

  get completados() {
    return this.camiones.filter(c => c.estado === 'COMPLETADO');
  }

  get m3Programado() {
    return this.programados.length * this.m3PorCamion;
  }

  get m3Impreso() {
    return this.impresos.length * this.m3PorCamion;
  }

  get m3Transito() {
    return this.enTransito.length * this.m3PorCamion;
  }

  get m3Obra() {
    return this.enObra.length * this.m3PorCamion;
  }

  get m3Completado() {
    return this.completados.length * this.m3PorCamion;
  }

  onClose() {
    this.close.emit();
  }
}