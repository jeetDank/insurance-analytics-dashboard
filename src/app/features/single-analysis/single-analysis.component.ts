import { Component } from '@angular/core';
import {SelectModule} from 'primeng/select'
import {ButtonModule} from 'primeng/button'
import {MessageModule} from 'primeng/message'
import { IconsModule } from '../../common/components/icon/icons.module';
import { TableComponent } from '../../common/components/table/table.component';
import { SimpleMetricCardComponent } from '../../common/components/simple-metric-card/simple-metric-card.component';
import { CardSkeletonComponent } from '../../common/components/card-skeleton/card-skeleton.component';
import { CommonModule } from '@angular/common';
import { InsightsComponent } from '../../common/components/insights/insights.component';
import { AccordianComponent } from '../../common/components/accordian/accordian.component';

@Component({
  selector: 'app-single-analysis',
  imports: [AccordianComponent,InsightsComponent,SelectModule, ButtonModule, MessageModule, IconsModule, TableComponent, CardSkeletonComponent, CommonModule],
  templateUrl: './single-analysis.component.html',
  styleUrl: './single-analysis.component.scss'
})
export class SingleAnalysisComponent {

   skeletonVisible:boolean = true;

  constructor(){
      setTimeout(() => {
        this.skeletonVisible = false;
      }, 5000);
  }
  

}
