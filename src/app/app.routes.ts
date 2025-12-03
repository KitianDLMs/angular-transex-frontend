import { Routes } from '@angular/router';
import { NotAuthenticatedGuard } from '@auth/guards/not-authenticated.guard';
import { AuthenticatedGuard } from '@auth/guards/authenticated.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  { path: 'auth', loadChildren: () => import('./auth/auth.routes'), canMatch: [NotAuthenticatedGuard] },

  { path: 'admin', loadChildren: () => import('./admin-dashboard/admin-dashboard.routes'), canMatch: [AuthenticatedGuard] },

  { path: 'store-front', loadChildren: () => import('./store-front/store-front.routes'), canMatch: [AuthenticatedGuard] },

  { path: '**', redirectTo: 'auth/login' },
];
