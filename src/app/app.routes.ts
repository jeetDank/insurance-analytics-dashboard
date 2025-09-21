import { Routes } from '@angular/router';
import { FeaturesComponent } from './features/features.component';
import { PageNotFoundComponent } from './common/components/page-not-found/page-not-found.component';
import { LoginComponent } from './authentication/login/login.component';
import { AuthComponent } from './authentication/auth.component';

export const routes: Routes = [

  {path:"",redirectTo:"/auth/login",pathMatch:'full'},
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
