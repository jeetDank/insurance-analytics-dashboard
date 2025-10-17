import { Component } from '@angular/core';
import { SidebarComponent } from '../common/components/sidebar/sidebar.component';
import { IconsModule } from '../common/components/icon/icons.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ButtonModule } from 'primeng/button';
import { AccordianComponent } from '../common/components/accordian/accordian.component';
import { DrawerModule } from 'primeng/drawer';
import { PastDashboardsComponent } from './past-dashboards/past-dashboards.component';
import { SavedFormulasComponent } from './saved-formulas/saved-formulas.component';
import { CommonCardComponent } from '../common/components/common-card/common-card.component';
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
    CommonCardComponent,
    SidebarComponent,
    IconsModule,
    MatSidenavModule,
    ButtonModule,
    AccordianComponent,
    DrawerModule,
    PastDashboardsComponent,
    SavedFormulasComponent,
    EchartsComponent,
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
  },
  {
    companyName: 'Apple Inc.',
    metricName: 'Net Income',
    subTitle: null,
    metric: '$22.9B',
    metricPeriod: 'Q4 2024',
    trend: '+8.2% YoY',
    trendIcon: 'pi pi-arrow-up-right',
    trendPositive: true,
  },
  {
    companyName: 'Apple Inc.',
    metricName: 'Gross Margin',
    subTitle: null,
    metric: '46.2%',
    metricPeriod: 'Q4 2024',
    trend: '+0.5% vs Q3 2024',
    trendIcon: 'pi pi-arrow-up-right',
    trendPositive: true,
  },
  {
    companyName: 'Apple Inc.',
    metricName: 'Operating Income',
    subTitle: null,
    metric: '$29.3B',
    metricPeriod: 'Q4 2024',
    trend: '+7.8% YoY',
    trendIcon: 'pi pi-arrow-up-right',
    trendPositive: true,
  },
  {
    companyName: 'Apple Inc.',
    metricName: 'EPS (Diluted)',
    subTitle: 'Earnings Per Share',
    metric: '$1.46',
    metricPeriod: 'Q4 2024',
    trend: '+10.6% YoY',
    trendIcon: 'pi pi-arrow-up-right',
    trendPositive: true,
  },
  {
    companyName: 'Apple Inc.',
    metricName: 'Cash & Cash Equivalents',
    subTitle: null,
    metric: '$61.8B',
    metricPeriod: 'Q4 2024',
    trend: '-2.3% vs Q3 2024',
    trendIcon: 'pi pi-arrow-down-right',
    trendPositive: false,
  },
  {
    companyName: 'Apple Inc.',
    metricName: 'R&D Expenses',
    subTitle: 'Research & Development',
    metric: '$8.0B',
    metricPeriod: 'Q4 2024',
    trend: '+9.1% YoY',
    trendIcon: 'pi pi-arrow-up-right',
    trendPositive: true,
  },
  {
    companyName: 'Apple Inc.',
    metricName: 'Total Assets',
    subTitle: null,
    metric: '$365.7B',
    metricPeriod: 'Q4 2024',
    trend: '+3.4% YoY',
    trendIcon: 'pi pi-arrow-up-right',
    trendPositive: true,
  },

  // Microsoft Corporation Metrics
  {
    companyName: 'Microsoft Corporation',
    metricName: 'Revenue',
    subTitle: null,
    metric: '$65.6B',
    metricPeriod: 'Q1 FY2025',
    trend: '+16.0% YoY',
    trendIcon: 'pi pi-arrow-up-right',
    trendPositive: true,
  },
  {
    companyName: 'Microsoft Corporation',
    metricName: 'Net Income',
    subTitle: null,
    metric: '$24.7B',
    metricPeriod: 'Q1 FY2025',
    trend: '+11.0% YoY',
    trendIcon: 'pi pi-arrow-up-right',
    trendPositive: true,
  },
  {
    companyName: 'Microsoft Corporation',
    metricName: 'Gross Margin',
    subTitle: null,
    metric: '69.9%',
    metricPeriod: 'Q1 FY2025',
    trend: '+1.2% vs Q4 FY2024',
    trendIcon: 'pi pi-arrow-up-right',
    trendPositive: true,
  },
  {
    companyName: 'Microsoft Corporation',
    metricName: 'Operating Income',
    subTitle: null,
    metric: '$30.6B',
    metricPeriod: 'Q1 FY2025',
    trend: '+14.5% YoY',
    trendIcon: 'pi pi-arrow-up-right',
    trendPositive: true,
  },
  {
    companyName: 'Microsoft Corporation',
    metricName: 'EPS (Diluted)',
    subTitle: 'Earnings Per Share',
    metric: '$3.30',
    metricPeriod: 'Q1 FY2025',
    trend: '+10.0% YoY',
    trendIcon: 'pi pi-arrow-up-right',
    trendPositive: true,
  },
  {
    companyName: 'Microsoft Corporation',
    metricName: 'Cash & Cash Equivalents',
    subTitle: null,
    metric: '$78.4B',
    metricPeriod: 'Q1 FY2025',
    trend: '+5.2% vs Q4 FY2024',
    trendIcon: 'pi pi-arrow-up-right',
    trendPositive: true,
  },
  {
    companyName: 'Microsoft Corporation',
    metricName: 'Cloud Revenue',
    subTitle: 'Azure & Cloud Services',
    metric: '$38.9B',
    metricPeriod: 'Q1 FY2025',
    trend: '+22.0% YoY',
    trendIcon: 'pi pi-arrow-up-right',
    trendPositive: true,
  },
  {
    companyName: 'Microsoft Corporation',
    metricName: 'R&D Expenses',
    subTitle: 'Research & Development',
    metric: '$7.5B',
    metricPeriod: 'Q1 FY2025',
    trend: '+18.7% YoY',
    trendIcon: 'pi pi-arrow-up-right',
    trendPositive: true,
  },
  {
    companyName: 'Microsoft Corporation',
    metricName: 'Total Assets',
    subTitle: null,
    metric: '$512.1B',
    metricPeriod: 'Q1 FY2025',
    trend: '+8.9% YoY',
    trendIcon: 'pi pi-arrow-up-right',
    trendPositive: true,
  },
  {
    companyName: 'Microsoft Corporation',
    metricName: 'Free Cash Flow',
    subTitle: null,
    metric: '$19.3B',
    metricPeriod: 'Q1 FY2025',
    trend: '-2.1% vs Q4 FY2024',
    trendIcon: 'pi pi-arrow-down-right',
    trendPositive: false,
  }
  ];


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

  appleOption: EChartsOption = {
    title: {
      text: '',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ${c}B ({d}%)',
    },
    legend: {
      bottom: 0,
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
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
          },
        },
      },
    ],
  };

  // Microsoft FY2024 Revenue (in $M)
  microsoftOption: EChartsOption = {
    title: {
      text: '',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ${c}M ({d}%)',
    },
    legend: {
      bottom: 0,
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
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
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


  ngOnInit() {
  this.cardData = this.groupByMetricName(this.cardData);
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
}
