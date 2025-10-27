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
import {
  NgbAccordionModule,
  NgbModal,
  NgbModule,
} from '@ng-bootstrap/ng-bootstrap';
import { MainService } from '../common/services/main.service';
import { FormsModule } from '@angular/forms';
import { PopoverModule } from 'primeng/popover';

import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoaderService } from '../common/services/loader.service';
import { MessageModule } from 'primeng/message';
import { MessageService } from '../common/services/message.service';
import { catchError, EMPTY, finalize, forkJoin, of, tap } from 'rxjs';

interface message {
  text: string;
  type: string;
  timestamp: string;
}
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
  formula: {
    formula: string;
    use: string;
  } | null;
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
    MessageModule,
    PastDashboardsComponent,
    SavedFormulasComponent,
    EchartsComponent,
    NgbAccordionModule,
    FormsModule,
    PopoverModule,
    ProgressSpinnerModule,
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
        name: 'Revenue',
        formula: '',
        use: '',
      },
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
      formula: {
        name: 'Net Income',
        formula: '',
        use: '',
      },
    },
    {
      companyName: 'Amazon',
      metricName: 'Net Income',
      subTitle: null,
      metric: '$22.9B',
      metricPeriod: 'Q4 2024',
      trend: '+8.2% YoY',
      trendIcon: 'pi pi-arrow-up-right',
      trendPositive: true,
      formula: {
        name: 'Net Income',
        formula: '',
        use: '',
      },
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
    },
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

  isLoaderShowing: boolean | null = null;
  userQuery: string = '';
  currentMsg: message | null = null;

  constructor(
    private msg: MessageService,
    private main: MainService,
    private loader: LoaderService
  ) {
    loader.isLoading.subscribe((res) => {
      this.isLoaderShowing = res;
      console.log(res);
    });

    this.msg.message$.subscribe({
      next: (res: any) => {
        this.currentMsg = res;
        console.log(res);
      },
    });
  }

  ngOnInit() {
    this.cardData = this.groupByMetricName(this.cardData);
    this.processDataForComparison();
  }

  pushPromptToQueryBox(query: any) {
    this.userQuery = query.prompt;
  }

  groupByMetricName(data: any[]) {
    const grouped: { [key: string]: any[] } = {};

    data.forEach((item) => {
      const key = item.metricName;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    // Flatten grouped metrics preserving metric order alphabetically or by first appearance
    return Object.keys(grouped)
      .sort() // optional: sort alphabetically by metricName
      .flatMap((key) => grouped[key]);
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

  sendQuery(): void {
    const payload = { query: this.userQuery };

    // Start loading state
    this.msg.query.searching();

    this.main
      .parseQuery(payload)
      .pipe(
        // Optional: show loading indicator or transform data
        tap(() => {
          this.loader.show();
        }),

        // Handle errors gracefully
        catchError((error) => {
          console.error('API Error:', error);

          // Notify user about the error
          this.msg.query.error();

          // Return EMPTY observable to safely terminate stream
          return EMPTY;
        }),

        // Ensure finalization logic always runs (e.g., stop loader)
        finalize(() => {
          this.loader.hide();
        })
      )
      .subscribe({
        next: (res: any) => {
          console.log('API Response:', res);

          // Handle successful response
          this.msg.setMessage(res.message, 'success');
          this.handleResponse(res);
        },
        complete: () => {
          console.log('Query completed.');
        },
      });
  }

  userQueryResponseData: any;

  handleResponse(res: any): void {
  this.foundCompaniesData = [];
  this.userQueryResponseData = res?.parsed;

  // Validate companies array safely
  const companies: string[] = Array.isArray(this.userQueryResponseData?.companies)
    ? this.userQueryResponseData.companies
    : [];

  if (companies.length === 0) {
    console.warn('No valid companies found in response.');
    this.msg.setMessage('No companies found for this query.', 'warning');
    return;
  }

  this.msg.company.fetching();
  this.loader.show();

  // Map each company to an API observable with error handling
  const requests = companies.map((company) =>
    this.main.postCompanies({ company_input: company }).pipe(
      tap(() => console.log(`Fetching data for ${company}...`)),
      catchError((error) => {
        console.error(`Error fetching info for ${company}:`, error);
        this.msg.setMessage(`Error fetching company info: ${company}`, 'error');
        // Return a fallback object to keep the stream alive
        return of({ company_input: company, error: true, message: 'Failed to fetch company info.' });
      })
    )
  );

  // Run all requests simultaneously and handle all results together
  forkJoin(requests)
    .pipe(
      finalize(() => {
        this.loader.hide();
        
      })
    )
    .subscribe({
      next: (results: any[]) => {
        console.log('All company info results:', results);

        // Separate successful and failed results
        const successfulResults = results.filter((r) => !r.error);
        const failedResults = results.filter((r) => r.error);

        // Save successful results
        this.foundCompaniesData = successfulResults;

        // Notify user
        if (successfulResults.length > 0) {
          this.msg.setMessage(
            `Fetched info for ${successfulResults.length} compan${successfulResults.length > 1 ? 'ies' : 'y'}.`,
            'success'
          );
        }

        if (failedResults.length > 0) {
          this.msg.setMessage(
            `${failedResults.length} compan${failedResults.length > 1 ? 'ies' : 'y'} failed to load.`,
            'warning'
          );
        }

        // Handle successful company responses (e.g. analysis trigger)
        successfulResults.forEach((res) => this.handleCompanyResponse(res));

        this.AnalyseCompanies();

        
      },
      error: (err) => {
        console.error('Unexpected error while fetching companies:', err);
        this.msg.setMessage('An unexpected error occurred while fetching companies.', 'error');
      },
      complete: () => {
        console.log('All company info fetch requests complete.');
      },
    });
}


  foundCompaniesData: any = [];

  handleCompanyResponse(res: any) {
    this.foundCompaniesData.push({
      payload: { cik: res.company.identifiers.cik, name: res.company.name },
      data: res,
    });

    
  }

  AnalyseCompanies(): void {
    // Defensive check for company data
    if (
      !Array.isArray(this.foundCompaniesData) ||
      this.foundCompaniesData.length === 0
    ) {
      console.warn('No company data available for analysis.');
      this.msg.setMessage('No company data to analyze.', 'error');
      return;
    }

    // Extract time period safely
    const timePeriods = this.userQueryResponseData?.time_periods;
    const dateRange =
      Array.isArray(timePeriods) && timePeriods.length > 0
        ? this.getQuarterDates(timePeriods[0])
        : null;

    if (!dateRange) {
      console.warn('Invalid or missing time period. Using default date range.');
    }

    // Build payload safely and cleanly
    const payload = {
      companies: this.foundCompaniesData
        .map((company: any) => company?.payload)
        .filter((p: any) => !!p), // remove invalid ones
      start_date: dateRange?.start_date || '2024-01-01',
      end_date: dateRange?.end_date || '2025-10-22',
      filing_type: '10-Q',
    };

    if (payload.companies.length === 0) {
      console.warn('No valid companies in payload.');
      this.msg.setMessage('No valid companies to analyze.', 'warning');
      return;
    }

    console.log('Analysis payload:', payload);
    this.msg.analyse.preparing();

    // API call with RxJS operators
    this.main
      .startAnalysis(payload)
      .pipe(
        tap(() => {
          this.loader.show();
        }),
        catchError((error) => {
          console.error('Error during analysis:', error);
          this.msg.setMessage('Failed to analyze companies.', 'error');
          return EMPTY;
        }),
        finalize(() => {
          this.loader.hide();
        })
      )
      .subscribe({
        next: (res) => {
          console.log('Analysis result:', res);
          this.msg.analyse.success();
          this.handleAnalysisResponse(res);
        },
        complete: () => console.log('Analysis request complete.'),
      });
  }

  analysisData: any;

  handleAnalysisResponse(res: any) {
    console.log(res);
    this.analysisData = res;
  }

  processDataForComparison() {
    // Extract unique companies
    this.companies = [
      ...new Set(this.cardData.map((item) => item.companyName)),
    ];

    // Limit to 4 companies
    if (this.companies.length > 4) {
      console.warn('More than 4 companies detected. Only showing first 4.');
      this.companies = this.companies.slice(0, 4);
    }

    // Extract unique metrics
    const uniqueMetrics = [
      ...new Set(this.cardData.map((item) => item.metricName)),
    ];

    // Build comparison structure
    this.comparisonMetrics = uniqueMetrics.map((metricName) => {
      const companiesData: ComparisonMetric['companies'] = {};

      // Get subtitle from first occurrence of this metric
      const firstMetric = this.cardData.find(
        (item) => item.metricName === metricName
      );
      const subTitle = firstMetric?.subTitle || null;
      const formula = firstMetric?.formula || null;

      // For each company, find if they have this metric
      this.companies.forEach((companyName) => {
        const metricData = this.cardData.find(
          (item) =>
            item.companyName === companyName && item.metricName === metricName
        );

        if (metricData) {
          companiesData[companyName] = {
            metric: metricData.metric,
            metricPeriod: metricData.metricPeriod,
            trend: metricData.trend,
            trendIcon: metricData.trendIcon,
            trendPositive: metricData.trendPositive,
            available: true,
          };
        } else {
          companiesData[companyName] = {
            metric: 'N/A',
            metricPeriod: '',
            trend: '',
            trendIcon: '',
            trendPositive: false,
            available: false,
          };
        }
      });

      return {
        metricName,
        subTitle,
        formula,
        companies: companiesData,
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

  popoverData: any = null;

  updateFormulaToggleData(metric: any) {
    this.popoverData = metric;
  }

  getQuarterDates(
    period: string
  ): { start_date: string; end_date: string } | null {
    if (!period || typeof period !== 'string') return null;

    const match = period.match(/Q([1-4])\s*(\d{4})/i);
    if (!match) {
      console.warn(`Invalid time period format: ${period}`);
      return null;
    }

    const quarter = parseInt(match[1], 10);
    const year = parseInt(match[2], 10);

    // Define start/end months for each quarter
    const quarterRanges: Record<number, { start: string; end: string }> = {
      1: { start: `${year}-01-01`, end: `${year}-03-31` },
      2: { start: `${year}-04-01`, end: `${year}-06-30` },
      3: { start: `${year}-07-01`, end: `${year}-09-30` },
      4: { start: `${year}-10-01`, end: `${year}-12-31` },
    };

    return {
      start_date: quarterRanges[quarter].start,
      end_date: quarterRanges[quarter].end,
    };
  }
}
