import { Component } from '@angular/core';
import {SelectModule} from 'primeng/select'
import {ButtonModule} from 'primeng/button'
import {MessageModule} from 'primeng/message'
import { IconsModule } from '../../common/components/icon/icons.module';
import { CardSkeletonComponent } from '../../common/components/card-skeleton/card-skeleton.component';
import { CommonModule } from '@angular/common';
import { AccordianComponent } from '../../common/components/accordian/accordian.component';
import {MatTabsModule} from '@angular/material/tabs';
import { CommonContainerComponent } from '../../common/components/common-container/common-container.component';
import { FileUploadModule } from 'primeng/fileupload';
import { HttpClient } from '@angular/common/http';
import { TableComponent } from '../../common/components/table/table.component';
import { EChartsOption } from 'echarts';
import { EchartsComponent } from '../../common/components/echart/echart.component';

@Component({
  selector: 'app-data-processing',
  imports:[EchartsComponent,TableComponent,FileUploadModule,CommonContainerComponent,MatTabsModule,AccordianComponent,SelectModule, ButtonModule, MessageModule, IconsModule, CardSkeletonComponent, CommonModule],
  templateUrl: './data-processing.component.html',
  styleUrl: './data-processing.component.scss'
})
export class DataProcessingComponent {

  skeletonVisible:boolean = false;

  onUpload(event:any){

  }

  chartOptions: EChartsOption = {
    title: {
    text: 'Insurance Claims Trend',
    left: 'center'
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    data: ['Filed Claims', 'Approved Claims'],
    top: 'bottom'
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
  },
  yAxis: {
    type: 'value',
    name: 'Number of Claims'
  },
  series: [
    {
      name: 'Filed Claims',
      type: 'line',
      smooth: true,
      data: [120, 200, 150, 80, 70, 110, 130]
    },
    {
      name: 'Approved Claims',
      type: 'line',
      smooth: true,
      data: [100, 180, 130, 60, 50, 90, 110]
    }
  ]
  };



}
