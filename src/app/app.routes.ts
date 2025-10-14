import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './common/components/page-not-found/page-not-found.component';


export const routes: Routes = [

  {path:"",redirectTo:"/auth/login",pathMatch:'full'},
  {
    path: 'p-features',
    loadChildren: () =>
      import('./p-features/p-features.routes').then(
        (m) => m.routes
      ), // lazy load
  },
  {
    path: 'features',
    loadChildren: () =>
      import('./features/feature.routes').then(
        (m) => m.routes
      ), // lazy load
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./authentication/auth.routes').then(
        (m) => m.routes
      ),
  },
 
  { path: '**', component: PageNotFoundComponent }, // wildcard fallback
];
