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

export const storeFrontRoutes: Routes = [
  {
    path: '',
    component: StoreFrontLayoutComponent,
    children: [
      { path: '', component: HomePageComponent },

      { path: 'obras', component: ObraPageComponent },

      { path: 'seguimiento', component: SeguimientoPageComponent },

      { path: 'docs', component: DocsPageComponent },      

      { path: 'laboratorio', component: LaboratorioPageComponent },            

      { path: 'programacion', component: ProgramacionPageComponent },

      { path: 'obra/:idSlug', component: ObraPageComponent },

      { path: 'ordr', component: OrdrPageComponent },

      { path: '**', component: NotFoundPageComponent },
    ],
  },

  { path: '**', redirectTo: '' },
];

export default storeFrontRoutes;
