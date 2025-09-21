import { Routes } from '@angular/router';
import { PageNotFoundComponent } from '../common/components/page-not-found/page-not-found.component';
import { FeaturesComponent } from './features.component';


export const routes: Routes = [
    
  {
    path:"",
    component:FeaturesComponent,
    children:[
        
    ]
  }
    ,
  { path: '**', component: PageNotFoundComponent }, // wildcard fallback
];
