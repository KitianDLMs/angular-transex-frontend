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
import { SchdlService } from '@shared/services/schdl.service';
import { OrdrService } from '@shared/services/ordr.service';

mapboxgl.accessToken = environment.mapboxKey;

interface CamionEstado {
  hora: string;
  estado: string;
  cantidad: number;
  planta: string;
  truck: string;
  guia: string;
}

@Component({
  selector: 'app-seguimiento-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seguimiento-sheet.component.html',
})
export class SeguimientoOverlayComponent
  implements OnInit, AfterViewInit {

  // ========================
  // INPUT / OUTPUT
  // ========================
  @Input() ord!: any;
  @Output() close = new EventEmitter<void>();

  // ========================
  // MAPA
  // ========================
  divMap = viewChild<ElementRef>('map');
  map = signal<mapboxgl.Map | null>(null);
  loadingPrograma = false;

  // ========================
  // ACORDEÓN
  // ========================
  accordion: Record<string, boolean> = {
    programado: false,
    impreso: false,
    transito: false,
    obra: false,
    completado: false,
  };

  // ========================
  // DATA BASE
  // ========================
  camiones: CamionEstado[] = [];

  programados: CamionEstado[] = [];
  impresos: CamionEstado[] = [];
  enTransito: CamionEstado[] = [];
  enObra: CamionEstado[] = [];
  completados: CamionEstado[] = [];

  m3Programado = 0;
  m3Impreso = 0;
  m3Transito = 0;
  m3Obra = 0;
  m3Completado = 0;

  constructor(private ordrService: OrdrService) {}

  // ========================
  // INIT
  // ========================
  ngOnInit(): void {
    if (!this.ord?.order_code || !this.ord?.order_Date) return;
    this.loadingPrograma = true;
    
    this.ordrService
      .getProgramaPorPedido(this.ord.order_code, this.ord.order_Date)
      .subscribe({
        next: programa => {          
          this.procesarPrograma(programa);
          this.loadingPrograma = false;
        },
        error: err => {
          console.error('❌ Error al obtener programa del pedido', err);
          this.loadingPrograma = false;
        },
      });

    // ---- lo que ya tenías ----
    if (this.esPedidoFuturo) {
      this.camiones = [];
      this.recalcularEstados();
      return;
    }
  }

  // ========================
  // MAPA
  // ========================
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

  // ========================
  // LOGICA
  // ========================
  private recalcularEstados() {
    this.programados = this.camiones.filter(c => c.estado === '');
    this.impresos = this.camiones.filter(c => c.estado === 'IMPRESO / CARGANDO');
    this.enTransito = this.camiones.filter(c => c.estado === 'EN TRANSITO');
    this.enObra = this.camiones.filter(c => c.estado === 'EN OBRA');
    this.completados = this.camiones.filter(c => c.estado === 'COMPLETADO');

    const m3 = this.m3PorCamion;

    this.m3Programado = this.programados.length * m3;
    this.m3Impreso = this.impresos.length * m3;
    this.m3Transito = this.enTransito.length * m3;
    this.m3Obra = this.enObra.length * m3;
    this.m3Completado = this.completados.length * m3;
  }

  private procesarPrograma(programa: any[]) {
    // 🔄 RESET TOTAL
    this.programados = [];
    this.impresos = [];
    this.enTransito = [];
    this.enObra = [];
    this.completados = [];

    this.m3Programado = 0;
    this.m3Impreso = 0;
    this.m3Transito = 0;
    this.m3Obra = 0;
    this.m3Completado = 0;

    programa.forEach(p => {
      const estado = this.mapEstado(p.estado);
      const carga = Number(p.load_size) || 0;

      const camion: CamionEstado = {
        hora: p.hora,
        cantidad: carga,
        estado,
        planta: p.planta?.trim() || '—',
        truck: p.truck_code || '—',
        guia: p.tkt_code || '—',
      };
      switch (estado) {
        case '':
        case 'PROGRAMADO':          
          this.programados.push(camion);
          this.m3Programado += carga;
          break;

        case 'IMPRESO / CARGANDO':        
          this.impresos.push(camion);
          this.m3Impreso += carga;
          break;

        case 'EN TRANSITO':
          this.enTransito.push(camion);
          this.m3Transito += carga;
          break;

        case 'EN OBRA':
        case 'DESCARGANDO':
          this.enObra.push(camion);
          this.m3Obra += carga;
          break;

        case 'TERMINADO':
          this.completados.push(camion);
          this.m3Completado += carga;
          break;
      }
    });
  }

  private mapEstado(estado: string): string {
    switch ((estado || '').toUpperCase()) {
      case '':
        return 'PROGRAMADO';
      case 'IMPRESO':
      case 'CARGANDO':
        return 'IMPRESO / CARGANDO';
      case 'TRANSITO':
      case 'EN TRANSITO':
        return 'EN TRANSITO';
      case 'DESCARGANDO':
      case 'EN OBRA':
        return 'EN OBRA';
      case 'TERMINADO':
        return 'TERMINADO';
      default:
        return '';
    }
  }

  toggle(key: keyof typeof this.accordion) {
    this.accordion[key] = !this.accordion[key];
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

  // ========================
  // HELPERS
  // ========================
  get esPedidoFuturo(): boolean {
    if (!this.ord?.order_date) return false;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaPedido = new Date(this.ord.order_date);
    fechaPedido.setHours(0, 0, 0, 0);

    return fechaPedido > hoy;
  }

  get m3Total() {
    return this.ord.order_qty;
  }

  get m3PorCamion() {
    return this.ord.load_size;
  }

  onClose() {
    this.close.emit();
  }
}