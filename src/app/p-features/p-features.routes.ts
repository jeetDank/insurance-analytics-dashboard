import { Routes } from '@angular/router';
import { PageNotFoundComponent } from '../common/components/page-not-found/page-not-found.component';
import { PFeaturesComponent } from './p-features.component';


export const routes: Routes = [
    
  {
    path:"",
    component:PFeaturesComponent,
    children:[
        
    ]
  }
    ,
  { path: '**', component: PageNotFoundComponent }, // wildcard fallback
];
