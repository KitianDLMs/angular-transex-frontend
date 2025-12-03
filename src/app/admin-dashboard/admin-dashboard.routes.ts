import { Routes } from '@angular/router';
import { AdminDashboardLayoutComponent } from './layouts/admin-dashboard-layout/admin-dashboard-layout.component';
import { ProductAdminPageComponent } from './pages/product-admin-page/product-admin-page.component';
import { ProductsAdminPageComponent } from './pages/products-admin-page/products-admin-page.component';
import { IsAdminGuard } from '@auth/guards/is-admin.guard';
// import { ObrasAdminPageComponent } from './pages/obras-admin-page/obras-admin-page.component';
// import { ObraAdminPageComponent } from './pages/obra-admin-page/obra-admin-page.component';
import { CustsAdminPageComponent } from './pages/custs-admin-page/custs-admin-page.component';
import { CustomerDetailsComponent } from './pages/cust-admin-page/cust-details/cust-details.component';
import { CustCreatePageComponent } from './pages/cust-create-page/cust-create-page.component';
import { UserListPageComponent } from './pages/user-list-page/user-list-page.component';
import { UserEditPageComponent } from './pages/user-edit-page/user-edit-page.component';
import { UserCreatePageComponent } from './pages/user-create-page/user-create-page.component';
import { ProjListPageComponent } from './pages/proj-list-page/proj-list-page.component';
import { ProjCreatePageComponent } from './pages/proj-create-page/proj-create-page.component';
import { ProjEditPageComponent } from './pages/proj-edit-page/proj-edit-page.component';
import { OrdrListPageComponent } from './pages/ordr-list-page/ordr-list-page.component';
import { OrdrCreatePageComponent } from './pages/ordr-create-page/ordr-create-page.component';
import { OrdrEditPageComponent } from './pages/ordr-edit-page/ordr-edit-page.component';

export const adminDashboardRoutes: Routes = [
  {
    path: '',
    component: AdminDashboardLayoutComponent,
    canMatch: [IsAdminGuard],
    children: [
      {
        path: 'products',
        component: ProductsAdminPageComponent,
      },
      {
        path: 'products/:id',
        component: ProductAdminPageComponent,
      },
      // {
      //   path: 'obras',
      //   component: ObrasAdminPageComponent,
      // },
      // {
      //   path: 'obras/:id',
      //   component: ObraAdminPageComponent,
      // },
      {
        path: 'customer',
        component: CustsAdminPageComponent,
      },
      {
        path: 'customer/create',
        component: CustCreatePageComponent,
      },              
      {
        path: 'customer/:custCode',
        component: CustomerDetailsComponent,
      }, 
      {
        path: 'proj',
        component: ProjListPageComponent,
      },
      {
        path: 'proj/create',
        component: ProjCreatePageComponent,
      },              
      {
        path: 'proj/:proj_code',
        component: ProjEditPageComponent,
      }, 
      {
        path: 'ordr',
        component: OrdrListPageComponent,
      },
      {
        path: 'ordr/create',
        component: OrdrCreatePageComponent,
      },              
      {
        path: 'ordr/edit/:order_code',
        component: OrdrEditPageComponent,
      }, 
      {
        path: 'users',
        component: UserListPageComponent,
      },
       {
        path: 'users/create',
        component: UserCreatePageComponent,
      },
      {
        path: 'users/:id',
        component: UserEditPageComponent,
      },
      {
        path: '**',
        redirectTo: 'customer',
      },
    ],
  },
];

export default adminDashboardRoutes;
