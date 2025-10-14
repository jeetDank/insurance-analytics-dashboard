import { Component, OnInit } from '@angular/core';
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
import { TableComponent } from '../../common/components/table/table.component';
import { EChartsOption } from 'echarts';
import { EchartsComponent } from '../../common/components/echart/echart.component';

@Component({
  selector: 'app-data-processing',
  imports:[EchartsComponent,TableComponent,FileUploadModule,CommonContainerComponent,MatTabsModule,AccordianComponent,SelectModule, ButtonModule, MessageModule, IconsModule, CardSkeletonComponent, CommonModule],
  templateUrl: './data-processing.component.html',
  styleUrl: './data-processing.component.scss'
})
export class DataProcessingComponent implements OnInit {

  skeletonVisible:boolean = false;

  onUpload(event:any){

  }

  chartOptions: EChartsOption = {
   title: {
    text: '',
   
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
    name: 'Months',
    nameLocation: 'middle',
    nameGap: 30, // distance from axis line
    axisLine: { lineStyle: { color: '#666' } },
    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
  },
  yAxis: {
    type: 'value',
    name: 'Number of Claims',
    nameLocation: 'middle',
    nameGap: 50,
    axisLine: { lineStyle: { color: '#666' } },
    nameRotate: 90 // vertical orientation
  },
  series: [
    {
      name: 'Filed Claims',
      type: 'line',
      smooth: true,
      showSymbol: false, // remove point symbols
      lineStyle: {
        width: 3
      },
      areaStyle: {
        opacity: 0.2
      },
      emphasis: {
        focus: 'series'
      },
      data: [120, 250, 180, 90, 70, 160, 210]
    },
    {
      name: 'Approved Claims',
      type: 'line',
      smooth: true,
      showSymbol: false,
      lineStyle: {
        width: 3
      },
      areaStyle: {
        opacity: 0.2
      },
      emphasis: {
        focus: 'series'
      },
      data: [100, 220, 150, 70, 50, 140, 180]
    }
  ]
  };


  ngOnInit(): void {
      
  }


}
