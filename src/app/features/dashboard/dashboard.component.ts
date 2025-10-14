import { Component, OnInit } from '@angular/core';
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
import { MainService } from '../../common/services/main.service';
import { LoaderService } from '../../common/services/loader.service';

@Component({
  selector: 'app-dashboard',
  imports: [AccordianComponent,InsightsComponent,SelectModule, ButtonModule, MessageModule, IconsModule, TableComponent, SimpleMetricCardComponent, CardSkeletonComponent, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {


  metricData = [
    {
      name:"Revenue",
      data:"$11172M",
      trend:-223.4
    },
    {
      name:"Net Income",
      data:"17%",
      trend:15.3
    },
    {
      name:"Combined Ratio",
      data:"95.4%",
      trend:1.5
    },
    {
      name:"ROE",
      data:"$11172M",
      trend:223.4
    },
    {
      name:"Combined Ratio",
      data:"95.4%",
      trend:1.5
    },
    {
      name:"ROE",
      data:"$11172M",
      trend:223.4
    },
  ]
  skeletonVisible:boolean = true;

  

  constructor(private mainAPIService:MainService){
      

      

  }
  ngOnInit(): void {


    this.mainAPIService.loaderSubject.subscribe((res)=>{
      this.skeletonVisible = res;
      console.log(res);
      
    })

     
  }

  testAPI(){
     this.mainAPIService.getSlowData().subscribe({
        next:(res)=>{
          console.log(res);
        },
        error:(err)=>{
          console.log(err);
          
        }
      })
  }

}
