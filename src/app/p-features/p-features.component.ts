import { Component } from '@angular/core';
import { SidebarComponent } from '../common/components/sidebar/sidebar.component';
import { IconsModule } from '../common/components/icon/icons.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ButtonModule } from 'primeng/button';
import { AccordianComponent } from '../common/components/accordian/accordian.component';
import { DrawerModule } from 'primeng/drawer';
import { PastDashboardsComponent } from './past-dashboards/past-dashboards.component';
import { SavedFormulasComponent } from './saved-formulas/saved-formulas.component';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { EchartsComponent } from '../common/components/echart/echart.component';
import { ContainerCardComponent } from '../common/components/container-card/container-card.component';
import { EChartsOption } from 'echarts';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { ScrollTopModule } from 'primeng/scrolltop';
import { NgbAccordionModule, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MainService } from '../common/services/main.service';
import { FormsModule } from '@angular/forms';
import { PopoverModule } from 'primeng/popover';

import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoaderService } from '../common/services/loader.service';

interface referenceData {
  totalRefCount: number;
  sections: refSections[];
}
interface refSections {
  sectionName: string;
  references: references[];
}
interface references {
  logo: string | null;
  link: string;
  label: string;
}
interface CardData {
  companyName: string;
  metricName: string;
  subTitle: string | null;
  metric: string;
  metricPeriod: string;
  trend: string;
  trendIcon: string;
  trendPositive: boolean;
}

interface ComparisonMetric {
  metricName: string;
  subTitle: string | null;
  formula:{
    formula:string,
    use:string
  } | null
  companies: {
    [companyName: string]: {
      metric: string;
      metricPeriod: string;
      trend: string;
      trendIcon: string;
      trendPositive: boolean;
      available: boolean;
    };
  };
}

  


@Component({
  selector: 'app-p-features',
  imports: [
    ProgressBarModule,
    ScrollTopModule,
    TagModule,
    AccordionModule,
    EchartsComponent,
    ContainerCardComponent,
    DragDropModule,
    SidebarComponent,
    IconsModule,
    MatSidenavModule,
    ButtonModule,
    AccordianComponent,
    DrawerModule,
    PastDashboardsComponent,
    SavedFormulasComponent,
    EchartsComponent,
    NgbAccordionModule,
    FormsModule,
    PopoverModule,
    ProgressSpinnerModule
    
  ],
  templateUrl: './p-features.component.html',
  styleUrl: './p-features.component.scss',
})
export class PFeaturesComponent {
  visible: boolean = true;
  showFiller: any;
  activeTabIndex: number = 0;

  previousDashboards: boolean = false;
  formulas: boolean = false;

  sidebarData: any;

  cardData = [
  
  // Apple Inc. Metrics
  {
    companyName: 'Apple Inc.',
    metricName: 'Revenue',
    subTitle: null,
    metric: '$94.9B',
    metricPeriod: 'Q4 2024',
    trend: '+6.1% YoY',
    trendIcon: 'pi pi-arrow-up-right',
    trendPositive: true,
    formula: {
      name:"Revenue",
      formula:"",
      use:""
    }
  }
  
  ];

 companies: string[] = [];
  comparisonMetrics: ComparisonMetric[] = [];
  
  // View mode toggle
  viewMode: 'cards' | 'comparison' = 'comparison';

  samplePrompts: any = [
    {
      id: 0,
      prompt:
        'Show me the revenue data for Apple and Microsoft for the last two quarters',
    },
    {
      id: 1,
      prompt: 'Show me the revenue data broken down by geographic region',
    },
    {
      id: 2,
      prompt:
        'Give me the breakdown of revenue of Apple and Microsoft by segment',
    },
    { id: 3, prompt: 'Compare operating margins for Apple and Microsoft' },
  ];

   baseDarkChartTheme = {
  backgroundColor: 'transparent', // dark container already applied in UI
  textStyle: {
    color: '#e5e5e5', // matches var(--dark-text-primary)
  },
  title: {
    textStyle: {
      color: '#e5e5e5',
      fontSize: 16,
      fontWeight: 600,
    },
  },
  legend: {
    textStyle: {
      color: '#a0a0a0', // var(--dark-text-secondary)
    },
    itemWidth: 14,
    itemHeight: 10,
    icon: 'circle',
  },
  tooltip: {
    backgroundColor: 'rgba(50,50,50,0.9)',
    borderColor: '#333',
    textStyle: {
      color: '#fff',
    },
  },
};

appleOption: EChartsOption = {
  ...this.baseDarkChartTheme,
  title: {
    ...this.baseDarkChartTheme.title,
    text: '',
  },
  legend: {
    ...this.baseDarkChartTheme.legend,
    bottom: 0,
  },
  tooltip: {
    ...this.baseDarkChartTheme.tooltip,
    formatter: '{b}: ${c}B ({d}%)',
  },
  series: [
    {
      name: 'Apple Revenue',
      type: 'pie',
      radius: '65%',
      center: ['50%', '50%'],
      data: [
        { value: 201.18, name: 'iPhone' },
        { value: 96.17, name: 'Services' },
        { value: 37.01, name: 'Wearables/Home & Accessories' },
        { value: 29.98, name: 'Mac' },
        { value: 26.69, name: 'iPad' },
      ],
      label: {
        formatter: '{b}\n{d}%',
        color: '#ccc', // lighter for visibility
        fontSize: 12,
      },
      labelLine: {
        lineStyle: {
          color: '#555',
        },
      },
      itemStyle: {
        borderColor: '#1e2129',
        borderWidth: 2,
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 15,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    },
  ],
};

microsoftOption: EChartsOption = {
  ...this.baseDarkChartTheme,
  title: {
    ...this.baseDarkChartTheme.title,
    text: '',
  },
  legend: {
    ...this.baseDarkChartTheme.legend,
    bottom: 0,
  },
  tooltip: {
    ...this.baseDarkChartTheme.tooltip,
    formatter: '{b}: ${c}M ({d}%)',
  },
  series: [
    {
      name: 'Microsoft Revenue',
      type: 'pie',
      radius: '65%',
      center: ['50%', '50%'],
      data: [
        { value: 77728, name: 'Productivity & Business Processes' },
        { value: 105362, name: 'Intelligent Cloud' },
        { value: 62032, name: 'More Personal Computing' },
      ],
      label: {
        formatter: '{b}\n{d}%',
        color: '#ccc',
        fontSize: 12,
      },
      labelLine: {
        lineStyle: {
          color: '#555',
        },
      },
      itemStyle: {
        borderColor: '#1e2129',
        borderWidth: 2,
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 15,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    },
  ],
};



  referencesData: referenceData[] = [
    {
      totalRefCount: 5,
      sections: [
        {
          sectionName: 'SEC Filings:',
          references: [
            {
              logo: 'pi pi-book',
              link: 'https://www.sec.gov/edgar/browse/?CIK=320193',
              label: 'Apple Inc. - Form 10-Q Q4 2024',
            },
            {
              logo: 'pi pi-book',
              link: 'Microsoft Corp. - Form 10-Q Q4 2024',
              label: 'Apple Inc. - Form 10-Q Q3 2024',
            },
            {
              logo: 'pi pi-book',
              link: 'Microsoft Corp. - Form 10-Q Q4 2024',
              label: 'Apple Inc. - Form 10-Q Q3 2024',
            },
          ],
        },
        {
          sectionName: 'Reference Websites:',
          references: [
            {
              logo: 'pi pi-book',
              link: 'https://www.sec.gov/edgar',
              label: 'SEC EDGAR Database',
            },
          ],
        },
      ],
    },
  ];

  isLoaderShowing:boolean| null=null;
  userQuery:string ="" 
  constructor(private main:MainService,private loader:LoaderService){
     loader.isLoading.subscribe((res)=>{
      this.isLoaderShowing = res
      console.log(res);
      
    });
  }



  ngOnInit() {
  this.cardData = this.groupByMetricName(this.cardData);
   this.processDataForComparison();

   setTimeout(() => { 
    this.loader.show();
    
   }, 5000);
}


pushPromptToQueryBox(query:any){
  this.userQuery = query.prompt;
}

groupByMetricName(data: any[]) {
  const grouped: { [key: string]: any[] } = {};

  data.forEach(item => {
    const key = item.metricName;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  });

  // Flatten grouped metrics preserving metric order alphabetically or by first appearance
  return Object.keys(grouped)
    .sort() // optional: sort alphabetically by metricName
    .flatMap(key => grouped[key]);
}
  

  catchSidebarDataChange(data: any) {
    this.sidebarData = data;
    console.log('Logging from features component ', data);
  }

  isSidebarVisible() {
    this.visible = !this.visible;
  }
  catchActiveTabIndex(updatedTabIndex: any) {
    console.log(updatedTabIndex);

    this.activeTabIndex = updatedTabIndex.index;
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.cardData, event.previousIndex, event.currentIndex);
  }






  // API Interactions

  sendQuery(){
      let payload = {
        query:this.userQuery
      }
      this.main.parseQuery(payload).subscribe({

      })
  }


  processDataForComparison() {
    // Extract unique companies
    this.companies = [...new Set(this.cardData.map(item => item.companyName))];
    
    // Limit to 4 companies
    if (this.companies.length > 4) {
      console.warn('More than 4 companies detected. Only showing first 4.');
      this.companies = this.companies.slice(0, 4);
    }

    // Extract unique metrics
    const uniqueMetrics = [...new Set(this.cardData.map(item => item.metricName))];

    // Build comparison structure
    this.comparisonMetrics = uniqueMetrics.map(metricName => {
      const companiesData: ComparisonMetric['companies'] = {};
      
      // Get subtitle from first occurrence of this metric
      const firstMetric = this.cardData.find(item => item.metricName === metricName);
      const subTitle = firstMetric?.subTitle || null;
      const formula = firstMetric?.formula || null

      // For each company, find if they have this metric
      this.companies.forEach(companyName => {
        const metricData = this.cardData.find(
          item => item.companyName === companyName && item.metricName === metricName
        );

        if (metricData) {
          companiesData[companyName] = {
            metric: metricData.metric,
            metricPeriod: metricData.metricPeriod,
            trend: metricData.trend,
            trendIcon: metricData.trendIcon,
            trendPositive: metricData.trendPositive,
            available: true
          };
        } else {
          companiesData[companyName] = {
            metric: 'N/A',
            metricPeriod: '',
            trend: '',
            trendIcon: '',
            trendPositive: false,
            available: false
          };
        }
      });

      return {
        metricName,
        subTitle,
        formula,
        companies: companiesData
      };
    });
  }

  toggleView() {
    this.viewMode = this.viewMode === 'cards' ? 'comparison' : 'cards';
  }


  getColumnClass(): string {
    switch (this.companies.length) {
      case 1:
        return 'col-12';
      case 2:
        return 'col-md-6';
      case 3:
        return 'col-md-4';
      case 4:
        return 'col-md-3 col-sm-6';
      default:
        return 'col-md-3';
    }
  }

  /**
   * Get company keys for iteration
   */
  getCompanyKeys(companies: ComparisonMetric['companies']): string[] {
    return Object.keys(companies);
  }



  popoverData:any = null;

  updateFormulaToggleData(metric:any){

    this.popoverData = metric;

    
  }
















}
