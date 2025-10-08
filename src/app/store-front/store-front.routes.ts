import { Routes } from '@angular/router';
import { StoreFrontLayoutComponent } from './layouts/store-front-layout/store-front-layout.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { ObraPageComponent } from './pages/obras-page/obras-page.component';
import { SeguimientoPageComponent } from './pages/seguimiento-page/seguimiento-page.component';
import { ProgramacionPageComponent } from './pages/programacion/programacion-page.component';

export const storeFrontRoutes: Routes = [
  {
    path: '',
    component: StoreFrontLayoutComponent,
    children: [
      { path: '', component: HomePageComponent },

      // 🔹 Página de obras (lista o gestión general)
      { path: 'obras', component: ObraPageComponent },

      // 🔹 Página de seguimiento o mapa
      { path: 'seguimiento', component: SeguimientoPageComponent },

      // 🔹 Página de programación de obras o actividades
      { path: 'programacion', component: ProgramacionPageComponent },

      // 🔹 Detalle individual de una obra
      { path: 'obra/:idSlug', component: ObraPageComponent },

      // 🔹 Página no encontrada
      { path: '**', component: NotFoundPageComponent },
    ],
  },

  // 🔹 Si alguna ruta no coincide, redirige al home
  { path: '**', redirectTo: '' },
];

export default storeFrontRoutes;
