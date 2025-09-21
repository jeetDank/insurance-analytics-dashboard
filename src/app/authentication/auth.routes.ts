import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PageNotFoundComponent } from '../common/components/page-not-found/page-not-found.component';
import { AuthComponent } from './auth.component';

export const routes: Routes = [


  {
    path: '',
    component: AuthComponent,
    children: [
      { path: '', component: LoginComponent },
      { path: 'login', component: LoginComponent }
    ],
  },

  // root route

  { path: '**', component: PageNotFoundComponent }, // wildcard fallback
];
