import { Routes } from '@angular/router';
import { StoreFrontLayoutComponent } from './layouts/store-front-layout/store-front-layout.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { ObraPageComponent } from './pages/obras-page/obras-page.component';
import { SeguimientoPageComponent } from './pages/seguimiento-page/seguimiento-page.component';
import { ProgramacionPageComponent } from './pages/programacion/programacion-page.component';
import { OrdrPageComponent } from './pages/ordr-page/ordr-page.component';
import { DocsPageComponent } from './pages/docs-page/docs-page.component';
import { LaboratorioPageComponent } from './pages/laboratorio-page/laboratorio-page.component';
import { PedidosActualesComponent } from './pages/pedidos-actuales/pedidos-actuales.component';
import { PedidosFuturosComponent } from './pages/pedidos-futuros/pedidos-futuros.component';

export const storeFrontRoutes: Routes = [
  {
    path: '',
    component: StoreFrontLayoutComponent,
    children: [
      { path: '', component: OrdrPageComponent },

      { path: 'obras', component: ObraPageComponent },
            
      { path: 'pedidos-actuales', component: PedidosActualesComponent },
      
      { path: 'pedidos-futuros', component: PedidosFuturosComponent },

      { path: 'seguimiento', component: SeguimientoPageComponent },

      { path: 'docs', component: DocsPageComponent },      

      { path: 'laboratorio', component: LaboratorioPageComponent },            

      { path: 'programacion', component: ProgramacionPageComponent },

      { path: 'obra/:idSlug', component: ObraPageComponent },

      { path: 'ordr', component: HomePageComponent },

      { path: '**', component: NotFoundPageComponent },
    ],
  },

  { path: '**', redirectTo: '' },
];

export default storeFrontRoutes;
