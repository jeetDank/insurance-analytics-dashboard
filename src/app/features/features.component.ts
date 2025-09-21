import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';

import { SidebarComponent } from '../common/components/sidebar/sidebar.component';
import { IconsModule } from '../common/components/icon/icons.module';
import { MatTabsModule } from '@angular/material/tabs';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CommonContainerComponent } from '../common/components/common-container/common-container.component';
import { SingleAnalysisComponent } from './single-analysis/single-analysis.component';
import { ComparativeAnalysisComponent } from './comparative-analysis/comparative-analysis.component';
import { FormulaResultsComponent } from './formula-results/formula-results.component';
import { InteractiveAiChatsComponent } from './interactive-ai-chats/interactive-ai-chats.component';

@Component({
  selector: 'app-features',
  imports: [
    InteractiveAiChatsComponent,
    FormulaResultsComponent,
    ComparativeAnalysisComponent,
    SingleAnalysisComponent,
    RouterModule,
    SidebarComponent,
    MatSidenavModule,
    MatButtonModule,
    IconsModule,
    MatTabsModule,
    DashboardComponent,
    CommonContainerComponent,
  ],
  templateUrl: './features.component.html',
  styleUrl: './features.component.scss',
})
export class FeaturesComponent {
  visible: boolean = true;
  showFiller: any;

  isSidebarVisible() {
    this.visible = !this.visible;
  }
}
