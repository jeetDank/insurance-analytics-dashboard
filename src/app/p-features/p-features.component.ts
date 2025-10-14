import { Component } from '@angular/core';
import { SidebarComponent } from '../common/components/sidebar/sidebar.component';
import { IconsModule } from '../common/components/icon/icons.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ButtonModule } from 'primeng/button';
import { AccordianComponent } from '../common/components/accordian/accordian.component';
import { DrawerModule } from 'primeng/drawer';
import { PastDashboardsComponent } from './past-dashboards/past-dashboards.component';
import { SavedFormulasComponent } from './saved-formulas/saved-formulas.component';

@Component({
  selector: 'app-p-features',
  imports: [SidebarComponent,IconsModule, MatSidenavModule,ButtonModule,AccordianComponent,DrawerModule,PastDashboardsComponent,SavedFormulasComponent],
  templateUrl: './p-features.component.html',
  styleUrl: './p-features.component.scss'
})
export class PFeaturesComponent {

  visible: boolean = true;
  showFiller: any;
  activeTabIndex:number= 0;

  previousDashboards:boolean = false;
  formulas:boolean = false;

  sidebarData:any; 

  samplePrompts:any = [
   { id:0,prompt:"Show me the revenue data for Apple and Microsoft for the last two quarters"},
   { id:1,prompt:"Show me the revenue data broken down by geographic region"},
   { id:2,prompt:"Give me the breakdown of revenue of Apple and Microsoft by segment"},
   { id:3,prompt:"Compare operating margins for Apple and Microsoft"}
  ]

  catchSidebarDataChange(data:any){
    this.sidebarData = data;
    console.log("Logging from features component ",data);
    
  }

  isSidebarVisible() {
    this.visible = !this.visible;
  }
  catchActiveTabIndex(updatedTabIndex:any){
    
    console.log(updatedTabIndex);
  
    this.activeTabIndex = updatedTabIndex.index;
    
  }

}
