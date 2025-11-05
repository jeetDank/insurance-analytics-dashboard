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
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { MainService } from '../common/services/main.service';
import { FormsModule } from '@angular/forms';
import { PopoverModule } from 'primeng/popover';

import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LoaderService } from '../common/services/loader.service';
import { MessageModule } from 'primeng/message';
import { MessageService } from '../common/services/message.service';
import { catchError, EMPTY, finalize, forkJoin, of, tap } from 'rxjs';
import { SelectModule } from 'primeng/select';

interface message {
  text: string;
  type: string;
  timestamp: string;
}
interface referenceData {
  companyName: string;
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

interface MetricChild {
  name: string;
  value: number;
  description: string;
  percentage_of_parent: number;
  unit: string;
}

interface Metric {
  name: string;
  value: number;
  unit: string;
  children?: Record<string, Record<string, MetricChild>>;
}

interface Statement {
  metadata: {
    company_name: string;
    filing_date: string;
    period_end_date: string;
  };
  period: string;
  metrics: Record<string, Metric>;
}

interface CompanyResult {
  cik: string;
  company_name: string;
  statements: Statement[];
}

interface APIResponse {
  success: boolean;
  results: CompanyResult[];
}

// Output structure for pie chart data
interface PieChartDataPoint {
  name: string;
  value: number;
  percentage: number;
  formattedValue: string;
}

interface MetricPieChartData {
  metricName: string;
  totalValue: number;
  data: PieChartDataPoint[];
}

interface CompanyPieChartData {
  companyName: string;
  cik: string;
  period: string;
  filingDate: string;
  metrics: MetricPieChartData[];
}

// Enhanced structure for multi-quarter pie charts with segment type tracking
interface QuarterPieChartData {
  companyName: string;
  cik: string;
  period: string;
  filingDate: string;
  metricName: string;
  segmentType: string; // NEW: Track segment type (e.g., "Products/Services", "Business Segments")
  totalValue: number;
  data: PieChartDataPoint[];
}

// Output structure for bar chart data
interface BarChartDataPoint {
  companyName: string;
  quarter?: string; // Optional quarter field
  value: number;
  formattedValue: string;
}

interface MetricBarChartData {
  metricName: string;
  quarters: string[]; // List of quarters
  companies: string[]; // List of companies
  data: BarChartDataPoint[];
}

// Output structure for each chart
interface CompanyChartOption {
  companyName: string;
  cik: string;
  period: string;
  metricName: string;
  segmentType?: string; // NEW: Optional segment type for multi-segment charts
  chartOption: EChartsOption;
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

    SelectModule,
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

  cardData: any[] = [];

  companies: string[] = [];
  comparisonMetrics: ComparisonMetric[] = [];

  samplePrompts: any = [
    {
      id: 0,
      prompt:
        'Compare revenue and net income for Hartford and Travelers for last 2 quarters',
    },

    {
      id: 2,
      prompt:
        'Give me segment wise revenue breakdown for Hartford and Allstate for Q1 and Q2 2025',
    },
    {
      id: 3,
      prompt: 'Compare gross margins for JPM and PGR for last quarter',
    },
    {
      id: 3,
      prompt:
        'I need the revenue, net income, gross profit, and combined ratio for Hartford, Travelers, JPMorgan, and allstate for the last two reported quarters (Q1 and Q2).',
    },
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

  referencesData: referenceData[] | null = [
    // {
    //   totalRefCount: 5,
    //   sections: [
    //     {
    //       sectionName: 'SEC Filings:',
    //       references: [
    //         {
    //           logo: 'pi pi-book',
    //           link: 'https://www.sec.gov/edgar/browse/?CIK=320193',
    //           label: 'Apple Inc. - Form 10-Q Q4 2024',
    //         },
    //         {
    //           logo: 'pi pi-book',
    //           link: 'Microsoft Corp. - Form 10-Q Q4 2024',
    //           label: 'Apple Inc. - Form 10-Q Q3 2024',
    //         },
    //         {
    //           logo: 'pi pi-book',
    //           link: 'Microsoft Corp. - Form 10-Q Q4 2024',
    //           label: 'Apple Inc. - Form 10-Q Q3 2024',
    //         },
    //       ],
    //     },
    //     {
    //       sectionName: 'Reference Websites:',
    //       references: [
    //         {
    //           logo: 'pi pi-book',
    //           link: 'https://www.sec.gov/edgar',
    //           label: 'SEC EDGAR Database',
    //         },
    //       ],
    //     },
    //   ],
    // },
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

  ngOnInit() {}

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
  clearData() {
    this.cardData = [];
    this.allResponses = {};
    this.userQueryResponseData = null;
    this.foundCompaniesData = null;
    this.comparisonMetrics = [];
    this.companies = [];
    this.parsedChartData = null;
    this.chartOptions = null;
    this.referencesData = null;
    this.currentMsg = null;
    this.userQuery = '';
    this.ambiguityResolution = [];
  }
  userQueryResponseData: any;

  handleResponse(res: any): void {
    this.foundCompaniesData = [];
    this.userQueryResponseData = res?.parsed;
    this.allResponses.parsedData = res;

    // check for ambiguities

    if (this.userQueryResponseData?.ambiguities) {
      this.handleAmbiguity(this.userQueryResponseData?.ambiguities);
    }
    else{
      this.handleResponsesAfterAmbiguityResolution()
    }

    
  }

  handleResponsesAfterAmbiguityResolution(){
    // Validate companies array safely
    const companies: string[] = Array.isArray(
      this.userQueryResponseData?.companies
    )
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
          this.msg.setMessage(
            `Error fetching company info: ${company}`,
            'error'
          );
          // Return a fallback object to keep the stream alive
          return of({
            company_input: company,
            error: true,
            message: 'Failed to fetch company info.',
          });
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
              `Fetched info for ${successfulResults.length} compan${
                successfulResults.length > 1 ? 'ies' : 'y'
              }.`,
              'success'
            );
          }

          if (failedResults.length > 0) {
            this.msg.setMessage(
              `${failedResults.length} compan${
                failedResults.length > 1 ? 'ies' : 'y'
              } failed to load.`,
              'warning'
            );
          }

          // Handle successful company responses (e.g. analysis trigger)
          successfulResults.forEach((res) => this.handleCompanyResponse(res));
          this.allResponses.companyData = this.foundCompaniesData;
          this.AnalyseCompanies();
        },
        error: (err) => {
          console.error('Unexpected error while fetching companies:', err);
          this.msg.setMessage(
            'An unexpected error occurred while fetching companies.',
            'error'
          );
        },
        complete: () => {
          console.log('All company info fetch requests complete.');
        },
      });
  }

  ambiguityResolution: any = [
    // {
    //   metric_name: 'string',
    //   context: 'string',
    //   suggestions: ['string'],
    //   resolution_type: 'select',
    //   unresolved_word: 'string',
    // },
  ];

  handleAmbiguity(data: any) {
    console.log(data);

    data.forEach((suggestion: any, index: number) => {
      this.ambiguityResolution.push({
        index: index, // add index here
        metric_name: null,
        context: 'string',
        suggestions: suggestion.suggestions,
        resolution_type: 'select',
        unresolved_word: suggestion.name,
      });
    });
  }

  

  postAmbiguities() {
    const data = this.ambiguityResolution;
    let parseData = data.map((item: any) => {
      return {
        metric_name: item.metric_name,
        context: 'string',
        suggestions: item.suggestions,
        resolution_type: 'select',
      };
    });

    // Create an array of observables
    const requests = parseData.map((payload: any) => 
      this.main.resolveAmbiguity(payload)
    );

    // Execute all requests in parallel and wait for all to complete
    forkJoin(requests).subscribe({
      next: (responses:any) => {
        // All responses collected in array
        console.log('All responses:', responses);

        let metric_list = responses.map((response:any) => response.selected_metric)
    .filter((metric:any) => metric !== null && metric !== undefined)

        this.userQueryResponseData.metrics = [...metric_list]
        this.ambiguityResolution = []
        this.handleResponsesAfterAmbiguityResolution();
      },
      error: (err) => {
        console.error('Error in one or more requests:', err);
      }
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

    // Build payload safely and cleanly
    const payload = {
      companies: this.foundCompaniesData
        .map((company: any) => company?.payload)
        .filter((p: any) => !!p), // remove invalid ones
      time_periods: timePeriods,
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

  allResponses: any = {
    parsedData: null,
    companyData: null,
    analysisData: null,
    ambiguity: [
      {
        name: 'string',
        suggestions: ['string'],
        context: 'string',
        selectedOption: '',
      },
    ],
  };

  parsedChartData: any;
  chartOptions: any;

  checkIfSegmentKeywordPresent(): boolean {
    const keyword_check =
      this.userQueryResponseData?.analysis_intent?.toLowerCase() || '';

    const keywords = [
      'segment',
      'segment-wise',
      'segments',
      'segment breakdown',
    ];

    return keywords.some((keyword) => keyword_check.includes(keyword));
  }

  handleAnalysisResponse(res: any) {
    this.allResponses.analysisData = res;

    this.cardData = this.groupByMetricName(
      this.populateCardData(
        this.allResponses.analysisData,
        this.userQueryResponseData.metrics
      )
    );

    this.processDataForComparison();

    // Determine if we should use bar charts or pie charts
    const numberOfCompanies =
      this.allResponses.analysisData?.results?.length || 0;

    // Check if segment_filter exists and has data (not null and not empty)
    // const hasSegmentFilter =  this.userQueryResponseData?.segment_filter;
    const keyword_check = this.checkIfSegmentKeywordPresent();
    console.log(keyword_check);

    if (keyword_check) {
      // Segment filter exists - use pie charts for breakdown across all quarters and all segment types
      console.log(
        'Segment filter detected - generating multi-segment pie charts'
      );

      // NEW: Pass the array of companies directly instead of wrapping in APIResponse format
      this.parsedChartData = this.parseFinancialDataForMultiSegmentPieCharts(
        this.allResponses.analysisData.results, // Pass array directly
        this.userQueryResponseData.metrics
      );

      console.log('parsed chart data :', this.parsedChartData);

      this.chartOptions = this.createMultiQuarterPieChartOptions(
        this.parsedChartData
      );
      console.log('Multi-Segment Pie Chart Options:', this.chartOptions);
    } else if (numberOfCompanies > 1) {
      // Multiple companies without segment filter - use bar charts for comparison
      console.log(
        'Multiple companies without segment filter - generating bar charts'
      );
      const barChartData = this.parseFinancialDataForBarCharts(
        this.allResponses.analysisData,
        this.userQueryResponseData.metrics
      );
      this.chartOptions = this.createBarChartOptions(barChartData);
      console.log('Bar Chart Options:', this.chartOptions);
    } else {
      // Single company without segment filter - don't show any charts
      console.log(
        'Single company without segment filter - no charts to display'
      );
      this.chartOptions = null;
      this.parsedChartData = null;
    }

    // generate references and links
    this.referencesData = this.parseReferencesFromApiResponse(
      this.allResponses.analysisData
    );
  }

  /**
   * Determines if the query is requesting a segment/breakdown view
   */
  isSegmentBreakdownRequest(
    query: string,
    requestedMetrics: string[]
  ): boolean {
    const breakdownKeywords = [
      'breakdown',
      'segment',
      'segmentation',
      'by product',
      'by region',
      'product wise',
      'region wise',
      'distribution',
      'split',
      'composition',
      'mix',
    ];

    const lowerQuery = query.toLowerCase();
    const hasBreakdownKeyword = breakdownKeywords.some((keyword) =>
      lowerQuery.includes(keyword)
    );

    // Also check if requesting metrics that typically have breakdowns (like revenue)
    const metricsWithBreakdowns = ['revenue', 'sales', 'income'];
    const hasBreakdownMetric = requestedMetrics?.some((metric) =>
      metricsWithBreakdowns.some((bm) => metric.toLowerCase().includes(bm))
    );

    return hasBreakdownKeyword || hasBreakdownMetric;
  }

  formatCurrency(value: number): string {
    if (Math.abs(value) >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(2)}B`;
    } else if (Math.abs(value) >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    } else if (Math.abs(value) >= 1_000) {
      return `$${(value / 1_000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  }

  cleanMetricName(name: string): string {
    return name
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Helper function to clean segment type names for better display
   */
  cleanSegmentTypeName(segmentType: string): string {
    return segmentType
      .replace(/_/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * UPDATED: Enhanced parser that accepts array of companies directly
   * Each company object has statements array with quarter-wise data
   * Returns pie charts organized by: Company → Quarter → Segment Type → Metric
   */
  parseFinancialDataForMultiSegmentPieCharts(
    companiesArray: CompanyResult[],
    requestedMetrics?: string[]
  ): QuarterPieChartData[] | string {
    // Validate input - now expecting array directly
    if (
      !companiesArray ||
      !Array.isArray(companiesArray) ||
      companiesArray.length === 0
    ) {
      return 'No data available - No companies found in array';
    }

    const quarterChartsData: QuarterPieChartData[] = [];

    // Process each company in the array
    for (const company of companiesArray) {
      if (!company.statements || company.statements.length === 0) {
        continue; // Skip companies with no statements
      }

      // Process each statement (quarter/filing period)
      for (const statement of company.statements) {
        // Iterate through all metrics in the statement
        for (const [metricKey, metricValue] of Object.entries(
          statement.metrics
        )) {
          const cleanName = this.cleanMetricName(metricValue.name);

          // Filter by requested metrics if provided
          if (requestedMetrics && requestedMetrics.length > 0) {
            console.log('requested metrics', requestedMetrics);

            const isRequested = requestedMetrics.some(
              (rm) =>
                rm.toLowerCase().replace(/[^a-z0-9]/g, '') ===
                cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')
            );
            if (!isRequested) continue;
          }

          // Only process metrics that have children (breakdown data)
          if (
            metricValue.children &&
            Object.keys(metricValue.children).length > 0
          ) {
            // Iterate through ALL segment types (e.g., "Products/Services", "Business Segments")
            for (const [segmentType, segmentChildren] of Object.entries(
              metricValue.children
            )) {
              const pieChartPoints: PieChartDataPoint[] = [];

              // Extract each child segment for the pie chart
              for (const [childKey, childValue] of Object.entries(
                segmentChildren
              )) {
                pieChartPoints.push({
                  name:
                    childValue.description?.replace(
                      `${metricValue.name} - `,
                      ''
                    ) || childKey,
                  value: childValue.value,
                  percentage: childValue.percentage_of_parent,
                  formattedValue: this.formatCurrency(childValue.value),
                });
              }

              // Only add if we have valid data points
              if (pieChartPoints.length > 0) {
                quarterChartsData.push({
                  companyName: statement.metadata.company_name,
                  cik: company.cik,
                  period: statement.period,
                  filingDate: statement.metadata.filing_date,
                  metricName: cleanName,
                  segmentType: this.cleanSegmentTypeName(segmentType),
                  totalValue: metricValue.value,
                  data: pieChartPoints.sort(
                    (a, b) => b.percentage - a.percentage
                  ),
                });
              }
            }
          }
        }
      }
    }

    // Return appropriate message if no pie chart data was found
    if (quarterChartsData.length === 0) {
      return 'No data available - No metrics with breakdown data found';
    }

    // Sort the results to ensure proper ordering:
    // 1. By company name
    // 2. By period (chronologically)
    // 3. By segment type (alphabetically)
    quarterChartsData.sort((a, b) => {
      // First, sort by company name
      const companyCompare = a.companyName.localeCompare(b.companyName);
      if (companyCompare !== 0) return companyCompare;

      // Then, sort by period (extract year and quarter)
      const periodA = this.parsePeriodForSorting(a.period);
      const periodB = this.parsePeriodForSorting(b.period);
      if (periodA !== periodB) return periodA - periodB;

      // Finally, sort by segment type alphabetically
      return a.segmentType.localeCompare(b.segmentType);
    });

    return quarterChartsData;
  }

  /**
   * Helper function to parse period string for sorting
   * Converts "Q1 2025" to a sortable number like 20251
   */
  parsePeriodForSorting(period: string): number {
    const match = period.match(/Q(\d)\s*(\d{4})/);
    if (!match) return 0;
    const quarter = parseInt(match[1], 10);
    const year = parseInt(match[2], 10);
    return year * 10 + quarter; // e.g., 2025 Q1 → 20251
  }

  /**
   * LEGACY: Original parser for single-segment pie charts (kept for backwards compatibility)
   */
  parseFinancialDataForMultiQuarterPieCharts(
    apiResponse: APIResponse,
    requestedMetrics?: string[]
  ): QuarterPieChartData[] | string {
    // This is now just a wrapper that calls the multi-segment version
    return this.parseFinancialDataForMultiSegmentPieCharts(
      apiResponse.results,
      requestedMetrics
    );
  }

  parseFinancialDataForPieCharts(
    apiResponse: APIResponse
  ): CompanyPieChartData[] | string {
    // Validate API response
    if (!apiResponse || !apiResponse.success) {
      return 'No data available - API request was not successful';
    }

    if (!apiResponse.results || apiResponse.results.length === 0) {
      return 'No data available - No company results found';
    }

    const companiesData: CompanyPieChartData[] = [];

    // Process each company in the results
    for (const company of apiResponse.results) {
      if (!company.statements || company.statements.length === 0) {
        continue; // Skip companies with no statements
      }

      // Process each statement (filing period)
      for (const statement of company.statements) {
        const metricsData: MetricPieChartData[] = [];

        // Iterate through all metrics in the statement
        for (const [metricKey, metricValue] of Object.entries(
          statement.metrics
        )) {
          // Only process metrics that have children (breakdown data)
          if (
            metricValue.children &&
            Object.keys(metricValue.children).length > 0
          ) {
            const pieChartPoints: PieChartDataPoint[] = [];

            // Extract each child segment for the pie chart
            for (const [segmentType, segmentChildren] of Object.entries(
              metricValue.children
            )) {
              for (const [childKey, childValue] of Object.entries(
                segmentChildren
              )) {
                pieChartPoints.push({
                  name:
                    childValue.description?.replace(
                      `${metricValue.name} - `,
                      ''
                    ) || childKey,
                  value: childValue.value,
                  percentage: childValue.percentage_of_parent,
                  formattedValue: this.formatCurrency(childValue.value),
                });
              }
            }

            // Only add if we have valid data points
            if (pieChartPoints.length > 0) {
              metricsData.push({
                metricName: this.cleanMetricName(metricValue.name),
                totalValue: metricValue.value,
                data: pieChartPoints.sort(
                  (a, b) => b.percentage - a.percentage
                ), // Sort by percentage descending
              });
            }
          }
        }

        // Only add company data if we found metrics with breakdown
        if (metricsData.length > 0) {
          companiesData.push({
            companyName: statement.metadata.company_name,
            cik: company.cik,
            period: statement.period,
            filingDate: statement.metadata.filing_date,
            metrics: metricsData,
          });
        }
      }
    }

    // Return appropriate message if no pie chart data was found
    if (companiesData.length === 0) {
      return 'No data available - No metrics with breakdown data found';
    }

    return companiesData;
  }

  parseFinancialDataForBarCharts(
    apiResponse: APIResponse,
    requestedMetrics: string[]
  ): MetricBarChartData[] | string {
    // Validate API response
    if (!apiResponse || !apiResponse.success) {
      return 'No data available - API request was not successful';
    }

    if (!apiResponse.results || apiResponse.results.length === 0) {
      return 'No data available - No company results found';
    }

    // If only one company, return message to use pie chart instead
    if (apiResponse.results.length === 1) {
      return 'Use pie chart for single company analysis';
    }

    // Structure: Map<metricName, Map<quarter, Map<companyName, value>>>
    const metricsMap: Map<string, Map<string, Map<string, number>>> = new Map();
    const allQuarters = new Set<string>();
    const allCompanies = new Set<string>();

    // Process each company
    for (const company of apiResponse.results) {
      if (!company.statements || company.statements.length === 0) {
        continue;
      }

      // Process each statement (quarter) for this company
      for (const statement of company.statements) {
        const quarter = statement.period; // e.g., "Q1 2024"
        const companyName = statement.metadata.company_name;

        allQuarters.add(quarter);
        allCompanies.add(companyName);

        // Process each metric in the statement
        for (const [metricKey, metricValue] of Object.entries(
          statement.metrics
        )) {
          const cleanName = this.cleanMetricName(metricValue.name);

          // Filter by requested metrics if provided
          if (requestedMetrics && requestedMetrics.length > 0) {
            const isRequested = requestedMetrics.some(
              (rm) =>
                rm.toLowerCase().replace(/[^a-z0-9]/g, '') ===
                cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')
            );
            if (!isRequested) continue;
          }

          // Initialize nested maps if they don't exist
          if (!metricsMap.has(cleanName)) {
            metricsMap.set(cleanName, new Map());
          }

          const quarterMap = metricsMap.get(cleanName)!;
          if (!quarterMap.has(quarter)) {
            quarterMap.set(quarter, new Map());
          }

          // Add company data for this quarter
          quarterMap.get(quarter)!.set(companyName, metricValue.value);
        }
      }
    }

    // Convert to output format
    const barChartData: MetricBarChartData[] = [];

    metricsMap.forEach((quarterMap, metricName) => {
      // Sort quarters chronologically
      const sortedQuarters = Array.from(allQuarters).sort((a, b) => {
        // Extract quarter and year from format "Q1 2024"
        const [qA, yA] = a.split(' ');
        const [qB, yB] = b.split(' ');
        const yearDiff = parseInt(yA) - parseInt(yB);
        if (yearDiff !== 0) return yearDiff;
        return parseInt(qA.replace('Q', '')) - parseInt(qB.replace('Q', ''));
      });

      // Build data points for this metric
      const data: BarChartDataPoint[] = [];

      sortedQuarters.forEach((quarter) => {
        if (quarterMap.has(quarter)) {
          const companyMap = quarterMap.get(quarter)!;
          companyMap.forEach((value, companyName) => {
            data.push({
              companyName,
              quarter,
              value,
              formattedValue: this.formatCurrency(value),
            });
          });
        }
      });

      if (data.length > 0) {
        barChartData.push({
          metricName,
          quarters: sortedQuarters,
          companies: Array.from(allCompanies),
          data,
        });
      }
    });

    if (barChartData.length === 0) {
      return 'No data available - No metrics found for comparison';
    }

    return barChartData;
  }

  getMetricDataByName(
    parsedData: CompanyPieChartData[] | string,
    metricName: string
  ): CompanyPieChartData[] | string {
    if (typeof parsedData === 'string') {
      return parsedData; // Return error message as-is
    }

    const filteredData = parsedData
      .map((company) => ({
        ...company,
        metrics: company.metrics.filter((metric) =>
          metric.metricName.toLowerCase().includes(metricName.toLowerCase())
        ),
      }))
      .filter((company) => company.metrics.length > 0);

    if (filteredData.length === 0) {
      return `No data available for metric: ${metricName}`;
    }

    return filteredData;
  }

  // processDataForComparison() {
  //   // Extract unique companies
  //   this.companies = [
  //     ...new Set(this.cardData.map((item) => item.companyName)),
  //   ];

  //   // Limit to 4 companies
  //   if (this.companies.length > 4) {
  //     console.warn('More than 4 companies detected. Only showing first 4.');
  //     this.companies = this.companies.slice(0, 4);
  //   }

  //   // Extract unique metrics
  //   const uniqueMetrics = [
  //     ...new Set(this.cardData.map((item) => item.metricName)),
  //   ];

  //   // Build comparison structure
  //   this.comparisonMetrics = uniqueMetrics.map((metricName) => {
  //     const companiesData: ComparisonMetric['companies'] = {};

  //     // Get subtitle from first occurrence of this metric
  //     const firstMetric = this.cardData.find(
  //       (item) => item.metricName === metricName
  //     );
  //     const subTitle = firstMetric?.subTitle || null;
  //     const formula = firstMetric?.formula || null;

  //     // For each company, find if they have this metric
  //     this.companies.forEach((companyName) => {
  //       const metricData = this.cardData.find(
  //         (item) =>
  //           item.companyName === companyName && item.metricName === metricName
  //       );

  //       if (metricData) {
  //         companiesData[companyName] = {
  //           metric: metricData.metric,
  //           metricPeriod: metricData.metricPeriod,
  //           trend: metricData.trend,
  //           trendIcon: metricData.trendIcon,
  //           trendPositive: metricData.trendPositive,
  //           available: true,
  //         };
  //       } else {
  //         companiesData[companyName] = {
  //           metric: 'N/A',
  //           metricPeriod: '',
  //           trend: '',
  //           trendIcon: '',
  //           trendPositive: false,
  //           available: false,
  //         };
  //       }
  //     });

  //     return {
  //       metricName,
  //       subTitle,
  //       formula,
  //       companies: companiesData,
  //     };
  //   });
  // }

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

    // Extract unique metric + period combinations
    const uniqueMetricPeriods = [
      ...new Set(
        this.cardData.map((item) => `${item.metricName}|${item.metricPeriod}`)
      ),
    ];

    // Build comparison structure
    this.comparisonMetrics = uniqueMetricPeriods.map((metricPeriodKey) => {
      const [metricName, period] = metricPeriodKey.split('|');
      const companiesData: ComparisonMetric['companies'] = {};

      // Get subtitle and formula from first occurrence of this metric
      const firstMetric = this.cardData.find(
        (item) => item.metricName === metricName && item.metricPeriod === period
      );
      const subTitle = firstMetric?.subTitle || null;
      const formula = firstMetric?.formula || null;

      // For each company, find if they have this metric for this period
      this.companies.forEach((companyName) => {
        const metricData = this.cardData.find(
          (item) =>
            item.companyName === companyName &&
            item.metricName === metricName &&
            item.metricPeriod === period
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
            metricPeriod: period,
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

  getFirstAvailablePeriod(metric: ComparisonMetric): string {
    for (const company of this.companies) {
      if (
        metric.companies[company]?.available &&
        metric.companies[company]?.metricPeriod
      ) {
        return metric.companies[company].metricPeriod;
      }
    }
    return '';
  }
  /**
   * Get company keys for iteration
   */
  getCompanyKeys(companies: ComparisonMetric['companies']): string[] {
    return Object.keys(companies);
  }

  popoverData: any = {
    name: 'NA',
    formula: 'NA',
    error: '',
  };

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

  // populateCardData(apiResponse: any, requestedMetrics: string[]): any[] {
  //   const cardData: any[] = [];

  //   if (!apiResponse?.success || !apiResponse?.results?.length) {
  //     return cardData;
  //   }

  //   // Process each company
  //   apiResponse.results.forEach((company: any) => {
  //     const latestStatement = company.statements[0];
  //     const previousStatement = company.statements[1];

  //     if (!latestStatement) return;

  //     // Helper to format currency
  //     const formatCurrency = (value: number): string => {
  //       const absValue = Math.abs(value);
  //       if (absValue >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  //       if (absValue >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  //       return `$${value.toFixed(2)}`;
  //     };

  //     // Helper to format percentage
  //     const formatPercentage = (value: number): string =>
  //       `${value.toFixed(1)}%`;

  //     // Helper to get growth
  //     const getGrowth = (metricKey: string): number | null => {
  //       const current = latestStatement.metrics[metricKey];
  //       if (current?.yoy_growth != null) return current.yoy_growth;
  //       if (current?.qoq_growth != null) return current.qoq_growth;

  //       // Calculate from previous statement
  //       if (previousStatement?.metrics[metricKey]) {
  //         const prev = previousStatement.metrics[metricKey].value;
  //         if (prev !== 0) {
  //           return ((current.value - prev) / Math.abs(prev)) * 100;
  //         }
  //       }
  //       return null;
  //     };

  //     // Metric name mappings
  //     const metricNames: Record<
  //       string,
  //       { name: string; subTitle: string | null }
  //     > = {
  //       revenue: { name: 'Revenue', subTitle: null },
  //       net_income: { name: 'Net Income', subTitle: null },
  //       gross_profit: { name: 'Gross Profit', subTitle: null },
  //       operating_income: { name: 'Operating Income', subTitle: null },
  //       eps_diluted: { name: 'EPS (Diluted)', subTitle: 'Earnings Per Share' },
  //       cash_equivalents: { name: 'Cash & Cash Equivalents', subTitle: null },
  //       research_and_development: {
  //         name: 'R&D Expenses',
  //         subTitle: 'Research & Development',
  //       },
  //       total_assets: { name: 'Total Assets', subTitle: null },
  //       free_cash_flow: { name: 'Free Cash Flow', subTitle: null },
  //     };

  //     // Process each metric
  //     Object.keys(latestStatement.metrics).forEach((metricKey) => {
  //       const metric = latestStatement.metrics[metricKey];
  //       const config = metricNames[metricKey];

  //       if (!config) return; // Skip unknown metrics

  //       // Filter by requested metrics if provided
  //       if (requestedMetrics?.length > 0) {
  //         const isRequested = requestedMetrics.some(
  //           (rm) =>
  //             rm.toLowerCase().replace(/[^a-z0-9]/g, '') ===
  //             config.name.toLowerCase().replace(/[^a-z0-9]/g, '')
  //         );
  //         if (!isRequested) return;
  //       }

  //       const growth = getGrowth(metricKey);
  //       const isPositive = growth !== null ? growth >= 0 : true;

  //       cardData.push({
  //         companyName: company.company_name,
  //         metricName: config.name,
  //         subTitle: config.subTitle,
  //         metric: formatCurrency(metric.value),
  //         metricPeriod: latestStatement.period,
  //         trend:
  //           growth !== null
  //             ? `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}% YoY`
  //             : 'No change',
  //         trendIcon: isPositive
  //           ? 'pi pi-arrow-up-right'
  //           : 'pi pi-arrow-down-right',
  //         trendPositive: isPositive,
  //         formula: {
  //           name: config.name,
  //           formula: '',
  //           use: '',
  //         },
  //       });
  //     });

  //     // Add calculated Gross Margin if revenue and gross_profit exist
  //     if (
  //       latestStatement.metrics.revenue &&
  //       latestStatement.metrics.gross_profit
  //     ) {
  //       const margin =
  //         (latestStatement.metrics.gross_profit.value /
  //           latestStatement.metrics.revenue.value) *
  //         100;

  //       let marginGrowth: number | null = null;
  //       if (
  //         previousStatement?.metrics.revenue &&
  //         previousStatement?.metrics.gross_profit
  //       ) {
  //         const prevMargin =
  //           (previousStatement.metrics.gross_profit.value /
  //             previousStatement.metrics.revenue.value) *
  //           100;
  //         marginGrowth = margin - prevMargin;
  //       }

  //       if (
  //         !requestedMetrics?.length ||
  //         requestedMetrics.some((m) => m.toLowerCase().includes('margin'))
  //       ) {
  //         cardData.push({
  //           companyName: company.company_name,
  //           metricName: 'Gross Margin',
  //           subTitle: null,
  //           metric: formatPercentage(margin),
  //           metricPeriod: latestStatement.period,
  //           trend:
  //             marginGrowth !== null
  //               ? `${marginGrowth >= 0 ? '+' : ''}${marginGrowth.toFixed(
  //                   1
  //                 )}% vs prior period`
  //               : 'No change',
  //           trendIcon:
  //             marginGrowth !== null && marginGrowth >= 0
  //               ? 'pi pi-arrow-up-right'
  //               : 'pi pi-arrow-down-right',
  //           trendPositive: marginGrowth !== null ? marginGrowth >= 0 : true,
  //         });
  //       }
  //     }
  //   });

  //   return cardData;
  // }

  populateCardData(apiResponse: any, requestedMetrics: string[]): any[] {
    const cardData: any[] = [];

    if (!apiResponse?.success || !apiResponse?.results?.length) {
      return cardData;
    }

    // Process each company
    apiResponse.results.forEach((company: any) => {
      if (!company.statements?.length) return;

      // Process each statement (quarter)
      company.statements.forEach((statement: any, index: number) => {
        const previousStatement = company.statements[index + 1]; // Next item is previous period

        // Helper to format currency
        const formatCurrency = (value: number): string => {
          const absValue = Math.abs(value);
          if (absValue >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
          if (absValue >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
          return `$${value.toFixed(2)}`;
        };

        // Helper to format percentage
        const formatPercentage = (value: number): string =>
          `${(value * 100).toFixed(1)}%`;

        // Helper to format ratio
        const formatRatio = (value: number): string => `${value.toFixed(2)}`;

        // Helper to get growth
        const getGrowth = (metricKey: string): number | null => {
          const current = statement.metrics[metricKey];
          if (current?.yoy_growth != null) return current.yoy_growth;
          if (current?.qoq_growth != null) return current.qoq_growth;

          // Calculate from previous statement
          if (previousStatement?.metrics[metricKey]) {
            const prev = previousStatement.metrics[metricKey].value;
            if (prev !== 0) {
              return ((current.value - prev) / Math.abs(prev)) * 100;
            }
          }
          return null;
        };

        // Comprehensive metric name mappings
        const metricNames: Record<
          string,
          {
            name: string;
            subTitle: string | null;
            formatType: 'currency' | 'percentage' | 'ratio';
          }
        > = {
          // Income Statement Metrics
          revenue: { name: 'Revenue', subTitle: null, formatType: 'currency' },
          net_income: {
            name: 'Net Income',
            subTitle: null,
            formatType: 'currency',
          },
          gross_profit: {
            name: 'Gross Profit',
            subTitle: null,
            formatType: 'currency',
          },
          operating_income: {
            name: 'Operating Income',
            subTitle: null,
            formatType: 'currency',
          },
          ebitda: {
            name: 'EBITDA',
            subTitle:
              'Earnings Before Interest, Taxes, Depreciation & Amortization',
            formatType: 'currency',
          },
          interest_expense: {
            name: 'Interest Expense',
            subTitle: null,
            formatType: 'currency',
          },
          tax_expense: {
            name: 'Tax Expense',
            subTitle: null,
            formatType: 'currency',
          },
          operating_expenses: {
            name: 'Operating Expenses',
            subTitle: null,
            formatType: 'currency',
          },

          // Balance Sheet Metrics
          total_assets: {
            name: 'Total Assets',
            subTitle: null,
            formatType: 'currency',
          },
          cash_equivalents: {
            name: 'Cash & Cash Equivalents',
            subTitle: null,
            formatType: 'currency',
          },
          ppe: {
            name: 'Property, Plant & Equipment',
            subTitle: null,
            formatType: 'currency',
          },
          goodwill: {
            name: 'Goodwill',
            subTitle: null,
            formatType: 'currency',
          },
          total_liabilities: {
            name: 'Total Liabilities',
            subTitle: null,
            formatType: 'currency',
          },
          long_term_debt: {
            name: 'Long-term Debt',
            subTitle: null,
            formatType: 'currency',
          },
          shareholders_equity: {
            name: 'Shareholders Equity',
            subTitle: null,
            formatType: 'currency',
          },

          // Cash Flow Metrics
          operating_cash_flow: {
            name: 'Operating Cash Flow',
            subTitle: null,
            formatType: 'currency',
          },
          capex: {
            name: 'Capital Expenditures',
            subTitle: 'CapEx',
            formatType: 'currency',
          },
          investing_cash_flow: {
            name: 'Investing Cash Flow',
            subTitle: null,
            formatType: 'currency',
          },
          financing_cash_flow: {
            name: 'Financing Cash Flow',
            subTitle: null,
            formatType: 'currency',
          },
          free_cash_flow: {
            name: 'Free Cash Flow',
            subTitle: null,
            formatType: 'currency',
          },
          total_dividends: {
            name: 'Total Dividends',
            subTitle: null,
            formatType: 'currency',
          },

          // Per Share Metrics
          earnings_per_share: {
            name: 'EPS',
            subTitle: 'Earnings Per Share',
            formatType: 'ratio',
          },
          basic_earnings_per_share: {
            name: 'Basic EPS',
            subTitle: 'Basic Earnings Per Share',
            formatType: 'ratio',
          },
          eps_diluted: {
            name: 'Diluted EPS',
            subTitle: 'Diluted Earnings Per Share',
            formatType: 'ratio',
          },

          // Insurance-Specific Metrics
          premiums_earned: {
            name: 'Premiums Earned',
            subTitle: null,
            formatType: 'currency',
          },
          losses_and_lae: {
            name: 'Losses & LAE',
            subTitle: 'Losses and Loss Adjustment Expenses',
            formatType: 'currency',
          },
          benefits_losses_loss_adjustment: {
            name: 'Benefits, Losses & Loss Adjustment',
            subTitle: null,
            formatType: 'currency',
          },
          policyholder_dividends: {
            name: 'Policyholder Dividends',
            subTitle: null,
            formatType: 'currency',
          },
          amortization_dac: {
            name: 'Amortization of DAC',
            subTitle: 'Deferred Acquisition Costs',
            formatType: 'currency',
          },
          general_admin_expenses: {
            name: 'General & Admin Expenses',
            subTitle: null,
            formatType: 'currency',
          },
          net_investment_income: {
            name: 'Net Investment Income',
            subTitle: null,
            formatType: 'currency',
          },
          realized_investment_gains: {
            name: 'Realized Investment Gains',
            subTitle: null,
            formatType: 'currency',
          },
          invested_assets: {
            name: 'Invested Assets',
            subTitle: null,
            formatType: 'currency',
          },
          losses_and_lae_reserves: {
            name: 'Loss & LAE Reserves',
            subTitle: null,
            formatType: 'currency',
          },
          unearned_premiums: {
            name: 'Unearned Premiums',
            subTitle: null,
            formatType: 'currency',
          },
          underwriting_income: {
            name: 'Underwriting Income',
            subTitle: null,
            formatType: 'currency',
          },

          // Other Revenue/Expense
          other_revenues: {
            name: 'Other Revenues',
            subTitle: null,
            formatType: 'currency',
          },
          research_and_development: {
            name: 'R&D Expenses',
            subTitle: 'Research & Development',
            formatType: 'currency',
          },

          // Financial Ratios
          operating_margin: {
            name: 'Operating Margin',
            subTitle: null,
            formatType: 'percentage',
          },
          net_profit_margin: {
            name: 'Net Profit Margin',
            subTitle: null,
            formatType: 'percentage',
          },
          ebitda_margin: {
            name: 'EBITDA Margin',
            subTitle: null,
            formatType: 'percentage',
          },
          return_on_equity: {
            name: 'Return on Equity',
            subTitle: 'ROE',
            formatType: 'percentage',
          },
          return_on_assets: {
            name: 'Return on Assets',
            subTitle: 'ROA',
            formatType: 'percentage',
          },
          return_on_invested_capital: {
            name: 'Return on Invested Capital',
            subTitle: 'ROIC',
            formatType: 'percentage',
          },
          asset_turnover: {
            name: 'Asset Turnover',
            subTitle: null,
            formatType: 'ratio',
          },
          times_interest_earned: {
            name: 'Times Interest Earned',
            subTitle: null,
            formatType: 'ratio',
          },
          dividend_payout_ratio: {
            name: 'Dividend Payout Ratio',
            subTitle: null,
            formatType: 'percentage',
          },

          // Insurance-Specific Ratios
          loss_ratio: {
            name: 'Loss Ratio',
            subTitle: null,
            formatType: 'percentage',
          },
          expense_ratio: {
            name: 'Expense Ratio',
            subTitle: null,
            formatType: 'percentage',
          },
          combined_ratio: {
            name: 'Combined Ratio',
            subTitle: null,
            formatType: 'percentage',
          },
          dividend_ratio: {
            name: 'Dividend Ratio',
            subTitle: null,
            formatType: 'percentage',
          },
          underwriting_margin: {
            name: 'Underwriting Margin',
            subTitle: null,
            formatType: 'percentage',
          },
          investment_yield: {
            name: 'Investment Yield',
            subTitle: null,
            formatType: 'percentage',
          },
        };

        // Process each metric for this quarter
        Object.keys(statement.metrics).forEach((metricKey) => {
          const metric = statement.metrics[metricKey];
          const config = metricNames[metricKey];

          if (!config) return; // Skip unknown metrics

          // Filter by requested metrics if provided
          if (requestedMetrics?.length > 0) {
            const isRequested = requestedMetrics.some(
              (rm) =>
                rm.toLowerCase().replace(/[^a-z0-9]/g, '') ===
                config.name.toLowerCase().replace(/[^a-z0-9]/g, '')
            );
            if (!isRequested) return;
          }

          const growth = getGrowth(metricKey);
          const isPositive = growth !== null ? growth >= 0 : true;

          // Format value based on type
          let formattedValue: string;
          if (config.formatType === 'currency') {
            formattedValue = formatCurrency(metric.value);
          } else if (config.formatType === 'percentage') {
            formattedValue = formatPercentage(metric.value);
          } else {
            formattedValue = formatRatio(metric.value);
          }

          cardData.push({
            companyName: company.company_name,
            metricName: config.name,
            subTitle: config.subTitle,
            metric: formattedValue,
            metricPeriod: statement.period,
            trend:
              growth !== null
                ? `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}% YoY`
                : 'No change',
            trendIcon: isPositive
              ? 'pi pi-arrow-up-right'
              : 'pi pi-arrow-down-right',
            trendPositive: isPositive,
            formula: {
              name: config.name,
              formula: '',
              use: '',
            },
          });
        });

        // Add calculated Gross Margin if revenue and gross_profit exist
        if (statement.metrics.revenue && statement.metrics.gross_profit) {
          const margin =
            (statement.metrics.gross_profit.value /
              statement.metrics.revenue.value) *
            100;

          let marginGrowth: number | null = null;
          if (
            previousStatement?.metrics.revenue &&
            previousStatement?.metrics.gross_profit
          ) {
            const prevMargin =
              (previousStatement.metrics.gross_profit.value /
                previousStatement.metrics.revenue.value) *
              100;
            marginGrowth = margin - prevMargin;
          }

          if (
            !requestedMetrics?.length ||
            requestedMetrics.some(
              (m) =>
                m.toLowerCase().includes('margin') ||
                m.toLowerCase().includes('gross')
            )
          ) {
            cardData.push({
              companyName: company.company_name,
              metricName: 'Gross Margin',
              subTitle: null,
              metric: formatPercentage(margin / 100),
              metricPeriod: statement.period,
              trend:
                marginGrowth !== null
                  ? `${marginGrowth >= 0 ? '+' : ''}${marginGrowth.toFixed(
                      1
                    )}% vs prior period`
                  : 'No change',
              trendIcon:
                marginGrowth !== null && marginGrowth >= 0
                  ? 'pi pi-arrow-up-right'
                  : 'pi pi-arrow-down-right',
              trendPositive: marginGrowth !== null ? marginGrowth >= 0 : true,
              formula: {
                name: 'Gross Margin',
                formula: '(Gross Profit / Revenue) × 100',
                use: 'Measures profitability after cost of goods sold',
              },
            });
          }
        }
      });
    });

    return cardData;
  }

  consumable_response = [
    {
      company_name: 'company name',
      quarterly_data: [
        {
          metrics: {
            revenue: {
              children: {
                'Bussiness Segments': {},
                'Consolidation Segments': {},
              },
            },
          },
          quarter: 'Q1 2024',
        },
      ],
    },
  ];

  // Pie Chart functions

  getUnitFormatter(data: PieChartDataPoint[]): {
    unit: string;
    formatter: string;
    divisor: number;
  } {
    const maxValue = Math.max(...data.map((d) => Math.abs(d.value)));

    if (maxValue >= 1_000_000_000) {
      return {
        unit: 'B',
        formatter: '{b}: ${c}B ({d}%)',
        divisor: 1_000_000_000,
      };
    } else if (maxValue >= 1_000_000) {
      return { unit: 'M', formatter: '{b}: ${c}M ({d}%)', divisor: 1_000_000 };
    } else if (maxValue >= 1_000) {
      return { unit: 'K', formatter: '{b}: ${c}K ({d}%)', divisor: 1_000 };
    }
    return { unit: '', formatter: '{b}: ${c} ({d}%)', divisor: 1 };
  }

  /**
   * Creates pie chart options for multi-quarter, multi-segment data
   * Each chart represents one company, one metric, one quarter, and one segment type
   */
  createMultiQuarterPieChartOptions(
    parsedData: QuarterPieChartData[] | string
  ): CompanyChartOption[] | string {
    // Handle error message from parser
    if (typeof parsedData === 'string') {
      return parsedData;
    }

    // Validate input
    if (!parsedData || parsedData.length === 0) {
      return 'No data available to create charts';
    }

    const chartOptions: CompanyChartOption[] = [];

    // Process each quarter's data
    for (const quarterData of parsedData) {
      // Skip if no data points
      if (!quarterData.data || quarterData.data.length === 0) {
        continue;
      }

      // Determine the appropriate unit and formatter
      const { formatter, divisor } = this.getUnitFormatter(quarterData.data);

      // Convert data points to ECharts format
      const chartData = quarterData.data.map((point) => ({
        value: parseFloat((point.value / divisor).toFixed(2)),
        name: point.name,
      }));

      // Create the chart option using the base theme
      const chartOption: EChartsOption = {
        ...this.baseDarkChartTheme,
        title: {
          ...this.baseDarkChartTheme.title,
          text: `${quarterData.period} - ${quarterData.segmentType}`, // Show quarter and segment type as title
          left: 'center',
          textStyle: {
            color: '#e5e5e5',
            fontSize: 14,
            fontWeight: 600,
          },
        },
        legend: {
          ...this.baseDarkChartTheme.legend,
          bottom: 0,
          show: true,
          type: 'scroll',
        },
        tooltip: {
          ...this.baseDarkChartTheme.tooltip,
          formatter: formatter,
        },
        series: [
          {
            name: `${quarterData.companyName} - ${quarterData.metricName} - ${quarterData.period} - ${quarterData.segmentType}`,
            type: 'pie',
            radius: '60%',
            center: ['50%', '50%'],
            data: chartData,
            label: {
              formatter: '{b}\n{d}%',
              color: '#ccc',
              fontSize: 11,
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
              label: {
                show: true,
                fontSize: 13,
                fontWeight: 'bold',
              },
            },
          },
        ],
      };

      // Add to results
      chartOptions.push({
        companyName: quarterData.companyName,
        cik: quarterData.cik,
        period: quarterData.period,
        metricName: quarterData.metricName,
        segmentType: quarterData.segmentType, // NEW: Include segment type
        chartOption: chartOption,
      });
    }

    if (chartOptions.length === 0) {
      return 'No valid charts could be created from the data';
    }

    return chartOptions;
  }

  createPieChartOptions(
    parsedData: CompanyPieChartData[] | string
  ): CompanyChartOption[] | string {
    // Handle error message from parser
    if (typeof parsedData === 'string') {
      return parsedData;
    }

    // Validate input
    if (!parsedData || parsedData.length === 0) {
      return 'No data available to create charts';
    }

    const chartOptions: CompanyChartOption[] = [];

    // Process each company
    for (const company of parsedData) {
      // Process each metric for the company
      for (const metric of company.metrics) {
        // Skip metrics with no data
        if (!metric.data || metric.data.length === 0) {
          continue;
        }

        // Determine the appropriate unit and formatter
        const { formatter, divisor } = this.getUnitFormatter(metric.data);

        // Convert data points to ECharts format
        const chartData = metric.data.map((point) => ({
          value: parseFloat((point.value / divisor).toFixed(2)),
          name: point.name,
        }));

        // Create the chart option using the base theme
        const chartOption: EChartsOption = {
          ...this.baseDarkChartTheme,
          title: {
            ...this.baseDarkChartTheme.title,
            text: '', // You can set this to metric.metricName if you want titles
          },
          legend: {
            ...this.baseDarkChartTheme.legend,
            bottom: 0,
            show: false,
          },
          tooltip: {
            ...this.baseDarkChartTheme.tooltip,
            formatter: formatter,
          },
          series: [
            {
              name: `${company.companyName} - ${metric.metricName}`,
              type: 'pie',
              radius: '65%',
              center: ['50%', '50%'],
              data: chartData,
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

        // Add to results
        chartOptions.push({
          companyName: company.companyName,
          cik: company.cik,
          period: company.period,
          metricName: metric.metricName,
          chartOption: chartOption,
        });
      }
    }

    if (chartOptions.length === 0) {
      return 'No valid charts could be created from the data';
    }

    return chartOptions;
  }

  // Bar Chart functions

  createBarChartOptions(
    parsedData: MetricBarChartData[] | string
  ): CompanyChartOption[] | string {
    // Handle error message from parser
    if (typeof parsedData === 'string') {
      return parsedData;
    }

    // Validate input
    if (!parsedData || parsedData.length === 0) {
      return 'No data available to create charts';
    }

    const chartOptions: CompanyChartOption[] = [];

    // Define color palette for different companies
    const companyColors = [
      {
        base: ['#4a9eff', '#1e6bb8'],
        emphasis: ['#5dadff', '#2b7ed8'],
      },
      {
        base: ['#22c55e', '#16a34a'],
        emphasis: ['#34d369', '#1fb353'],
      },
      {
        base: ['#f59e0b', '#d97706'],
        emphasis: ['#fbbf24', '#f59e0b'],
      },
      {
        base: ['#ef4444', '#dc2626'],
        emphasis: ['#f87171', '#ef4444'],
      },
      {
        base: ['#a855f7', '#9333ea'],
        emphasis: ['#c084fc', '#a855f7'],
      },
    ];

    // Process each metric
    for (const metric of parsedData) {
      // Skip metrics with no data
      if (!metric.data || metric.data.length === 0) {
        continue;
      }

      // Determine the appropriate unit and divisor
      const maxValue = Math.max(...metric.data.map((d) => Math.abs(d.value)));
      let unit = '';
      let divisor = 1;

      if (maxValue >= 1_000_000_000) {
        unit = 'B';
        divisor = 1_000_000_000;
      } else if (maxValue >= 1_000_000) {
        unit = 'M';
        divisor = 1_000_000;
      } else if (maxValue >= 1_000) {
        unit = 'K';
        divisor = 1_000;
      }

      // Organize data by quarter and company
      const dataByQuarter: Map<string, Map<string, number>> = new Map();

      metric.data.forEach((point) => {
        const quarter = point.quarter || 'Unknown';
        if (!dataByQuarter.has(quarter)) {
          dataByQuarter.set(quarter, new Map());
        }
        dataByQuarter
          .get(quarter)!
          .set(point.companyName, point.value / divisor);
      });

      // Prepare series data - one series per company
      const series: any[] = [];

      metric.companies.forEach((companyName, index) => {
        const companyData: number[] = [];

        // For each quarter, get this company's value (or 0 if not available)
        metric.quarters.forEach((quarter) => {
          const quarterData = dataByQuarter.get(quarter);
          const value = quarterData?.get(companyName);
          companyData.push(
            value !== undefined ? parseFloat(value.toFixed(2)) : 0
          );
        });

        const colorIndex = index % companyColors.length;
        const colors = companyColors[colorIndex];

        series.push({
          name: companyName,
          type: 'bar',
          data: companyData,
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: colors.base[0] },
                { offset: 1, color: colors.base[1] },
              ],
            },
          },
          emphasis: {
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: colors.emphasis[0] },
                  { offset: 1, color: colors.emphasis[1] },
                ],
              },
            },
          },
          label: {
            show: false, // Hide individual bar labels for cleaner look
          },
        });
      });

      // Create the chart option using the base theme
      const chartOption: EChartsOption = {
        ...this.baseDarkChartTheme,
        title: {
          ...this.baseDarkChartTheme.title,
          text: '', // Set to metric.metricName if you want titles
        },
        tooltip: {
          ...this.baseDarkChartTheme.tooltip,
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
          formatter: (params: any) => {
            if (!Array.isArray(params)) params = [params];

            let result = `<strong>${params[0].name}</strong><br/>`;
            params.forEach((param: any) => {
              if (param.value !== 0) {
                result += `${param.marker} ${param.seriesName}: $${param.value}${unit}<br/>`;
              }
            });
            return result;
          },
        },
        legend: {
          ...this.baseDarkChartTheme.legend,
          show: true,
          top: 0,
          data: metric.companies,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top: '15%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: metric.quarters,
          axisLabel: {
            color: '#a0a0a0',
            rotate: metric.quarters.length > 4 ? 45 : 0,
            interval: 0,
          },
          axisLine: {
            lineStyle: {
              color: '#333',
            },
          },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#a0a0a0',
            formatter: `{value}${unit}`,
          },
          axisLine: {
            lineStyle: {
              color: '#333',
            },
          },
          splitLine: {
            lineStyle: {
              color: '#2a2a2a',
            },
          },
        },
        series: series,
      };

      // Add to results
      chartOptions.push({
        companyName: 'Multiple Companies',
        cik: 'comparison',
        period: `${metric.quarters[0]} - ${
          metric.quarters[metric.quarters.length - 1]
        }`,
        metricName: metric.metricName,
        chartOption: chartOption,
      });
    }

    if (chartOptions.length === 0) {
      return 'No valid charts could be created from the data';
    }

    return chartOptions;
  }

  getChartsByCompany(
    chartOptions: CompanyChartOption[] | string,
    companyName: string
  ): CompanyChartOption[] | string {
    if (typeof chartOptions === 'string') {
      return chartOptions;
    }

    const filtered = chartOptions.filter((chart) =>
      chart.companyName.toLowerCase().includes(companyName.toLowerCase())
    );

    if (filtered.length === 0) {
      return `No charts found for company: ${companyName}`;
    }

    return filtered;
  }

  getChartsByMetric(
    chartOptions: CompanyChartOption[] | string,
    metricNames: string[]
  ): CompanyChartOption[] | string {
    if (typeof chartOptions === 'string') {
      return chartOptions;
    }

    // Normalize all metric names for case-insensitive comparison
    const lowerCaseMetrics = metricNames.map((name) => name.toLowerCase());

    // Filter charts that match any of the provided metric names
    const filtered = chartOptions.filter((chart) =>
      lowerCaseMetrics.some((metric) =>
        chart.metricName.toLowerCase().includes(metric)
      )
    );

    if (filtered.length === 0) {
      return `No charts found for metrics: ${metricNames.join(', ')}`;
    }

    return filtered;
  }

  parseReferencesFromApiResponse(apiResponse: any): referenceData[] {
    // Handle null/undefined response
    if (!apiResponse || !apiResponse.success || !apiResponse.results) {
      return [];
    }

    const referencesData: referenceData[] = [];

    // Iterate through each result in the API response
    apiResponse.results.forEach((result: any) => {
      if (!result.statements || result.statements.length === 0) {
        return;
      }

      const secFilingReferences: references[] = [];
      const websiteReferences: references[] = [];
      const companyName = result.company_name || 'Unknown Company';

      // Extract SEC filing information from statements
      result.statements.forEach((statement: any) => {
        if (statement.metadata) {
          const metadata = statement.metadata;

          // Create SEC filing reference
          if (
            metadata.filing_url &&
            metadata.company_name &&
            metadata.filing_type
          ) {
            const period =
              statement.period ||
              (metadata.period_end_date
                ? this.formatPeriod(metadata.period_end_date)
                : 'N/A');

            secFilingReferences.push({
              logo: 'pi pi-book',
              link: metadata.filing_url,
              label: `${metadata.company_name} - Form ${metadata.filing_type} ${period}`,
            });
          }
        }
      });

      // Add SEC EDGAR database reference (always included if we have SEC filings)
      if (secFilingReferences.length > 0) {
        websiteReferences.push({
          logo: 'pi pi-book',
          link: 'https://www.sec.gov/edgar',
          label: 'SEC EDGAR Database',
        });
      }

      // Build sections array
      const sections: refSections[] = [];

      if (secFilingReferences.length > 0) {
        sections.push({
          sectionName: 'SEC Filings:',
          references: secFilingReferences,
        });
      }

      if (websiteReferences.length > 0) {
        sections.push({
          sectionName: 'Reference Websites:',
          references: websiteReferences,
        });
      }

      // Only add to referencesData if we have sections
      if (sections.length > 0) {
        referencesData.push({
          companyName: companyName, // Add company name
          totalRefCount: secFilingReferences.length + websiteReferences.length,
          sections: sections,
        });
      }
    });

    return referencesData;
  }

  formatPeriod(dateString: string): string {
    try {
      const date = new Date(dateString);
      const quarter = Math.ceil((date.getMonth() + 1) / 3);
      return `Q${quarter} ${date.getFullYear()}`;
    } catch (e) {
      return 'N/A';
    }
  }

  scrollToElement(element: HTMLElement) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  checkAndLowercase(input: string): string {
    const trimmed = input.trim();
    const hasMiddleSpace = trimmed.slice(1, -1).includes(' ');

    if (hasMiddleSpace) {
      console.log('Space detected in the middle of the string.');
    } else {
      console.log('No space in the middle of the string.');
    }

    // Make lowercase and replace spaces with underscores
    return input.toLowerCase().replace(/ /g, '_');
  }

  getFormulaByName(name: string) {
    const metric = this.checkAndLowercase(name);
    this.popoverData = {};

    this.main.getFormulaByName(metric).subscribe({
      next: (res: any) => {
        const formulaData = res.metric;
        this.popoverData.name = formulaData?.display_name;
        this.popoverData.formula = formulaData?.formula;
      },
      error: (err) => {
        this.popoverData.error = err?.error?.detail;
        console.log(err, this.popoverData);
      },
    });
  }
}
