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
import { CardSkeletonComponent } from '../common/components/card-skeleton/card-skeleton.component';
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
  children?: Record<string, MetricChild>;
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

// Enhanced structure for multi-quarter pie charts
interface QuarterPieChartData {
  companyName: string;
  cik: string;
  period: string;
  filingDate: string;
  metricName: string;
  totalValue: number;
  data: PieChartDataPoint[];
}

// Structure for segment-based pie charts
interface SegmentPieChartData {
  companyName: string;
  cik: string;
  period: string;
  filingDate: string;
  metricName: string;
  segmentCategory: string; // e.g., "Products/Services", "Business Segments"
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
  quarters: string[];
  companies: string[];
  data: BarChartDataPoint[];
}

// Output structure for each chart
interface CompanyChartOption {
  companyName: string;
  cik: string;
  period: string;
  metricName: string;
  segmentCategory?: string;
  chartOption: EChartsOption;
}

// Structure for organizing charts by company and quarter
interface CompanyQuarterCharts {
  companyName: string;
  cik: string;
  quarters: {
    period: string;
    filingDate: string;
    charts: CompanyChartOption[];
  }[];
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
    CardSkeletonComponent,
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
        'Show me the revenue data for Apple and Microsoft for the last two quarters',
    },

    {
      id: 2,
      prompt:
        'Give me the breakdown of revenue of Apple and Microsoft by segment for Q1 and Q2 2025',
    },
    { id: 3, prompt: 'Compare gross margins for Apple and Microsoft for last quarter' },
    { id: 3, prompt: 'I need the revenue, net income, gross profit, and combined ratio for Hartford, Travelers, JPMorgan, and Apple for the last two reported quarters (Q1 and Q2).' },
  ];

  baseDarkChartTheme = {
    backgroundColor: 'transparent',
    textStyle: {
      color: '#e5e5e5',
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
        color: '#a0a0a0',
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

  referencesData: referenceData[] | null = [];

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

    return Object.keys(grouped)
      .sort()
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

    this.msg.query.searching();

    this.main
      .parseQuery(payload)
      .pipe(
        tap(() => {
          this.loader.show();
        }),

        catchError((error) => {
          console.error('API Error:', error);
          this.msg.query.error();
          return EMPTY;
        }),

        finalize(() => {
          this.loader.hide();
        })
      )
      .subscribe({
        next: (res: any) => {
          console.log('API Response:', res);
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
    this.organizedChartsByCompany = null;
    this.referencesData = null;
    this.currentMsg = null;
    this.userQuery = '';
  }

  userQueryResponseData: any;

  handleResponse(res: any): void {
    this.foundCompaniesData = [];
    this.userQueryResponseData = res?.parsed;
    this.allResponses.parsedData = res;

    if (
      this.userQueryResponseData?.ambiguities &&
      this.userQueryResponseData.ambiguities.length == 0
    ) {
      // this.handleAmbiguity(this.userQueryResponseData?.ambiguities);
    }

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

    const requests = companies.map((company) =>
      this.main.postCompanies({ company_input: company }).pipe(
        tap(() => console.log(`Fetching data for ${company}...`)),
        catchError((error) => {
          console.error(`Error fetching info for ${company}:`, error);
          this.msg.setMessage(
            `Error fetching company info: ${company}`,
            'error'
          );
          return of({
            company_input: company,
            error: true,
            message: 'Failed to fetch company info.',
          });
        })
      )
    );

    forkJoin(requests)
      .pipe(
        finalize(() => {
          this.loader.hide();
        })
      )
      .subscribe({
        next: (results: any[]) => {
          console.log('All company info results:', results);

          const successfulResults = results.filter((r) => !r.error);
          const failedResults = results.filter((r) => r.error);

          this.foundCompaniesData = successfulResults;

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

  handleAmbiguity(data: any) {}

  foundCompaniesData: any = [];

  handleCompanyResponse(res: any) {
    this.foundCompaniesData.push({
      payload: { cik: res.company.identifiers.cik, name: res.company.name },
      data: res,
    });
  }

  AnalyseCompanies(): void {
    if (
      !Array.isArray(this.foundCompaniesData) ||
      this.foundCompaniesData.length === 0
    ) {
      console.warn('No company data available for analysis.');
      this.msg.setMessage('No company data to analyze.', 'error');
      return;
    }

    const timePeriods = this.userQueryResponseData?.time_periods;

    const payload = {
      companies: this.foundCompaniesData
        .map((company: any) => company?.payload)
        .filter((p: any) => !!p),
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
  organizedChartsByCompany: CompanyQuarterCharts[] | null = null;

  handleAnalysisResponse(res: any) {
    console.log(res);
    this.allResponses.analysisData = res;
    this.cardData = this.groupByMetricName(
      this.populateCardData(
        this.allResponses.analysisData,
        this.userQueryResponseData.metrics
      )
    );
    this.processDataForComparison();

    // Always generate quarter and segment-wise pie charts for all companies
    this.parsedChartData = this.parseFinancialDataForQuarterSegmentPieCharts(
      this.allResponses.analysisData,
      this.userQueryResponseData.metrics
    );

    if (typeof this.parsedChartData !== 'string') {
      this.chartOptions = this.createQuarterSegmentPieChartOptions(this.parsedChartData);
      
      // Organize charts by company and quarter for easier rendering
      this.organizedChartsByCompany = this.organizeChartsByCompanyAndQuarter(
        this.chartOptions
      );
      
      console.log('Organized Charts by Company and Quarter:', this.organizedChartsByCompany);
    } else {
      console.warn('Chart generation warning:', this.parsedChartData);
      this.chartOptions = this.parsedChartData;
      this.organizedChartsByCompany = null;
    }

    // Generate references and links
    this.referencesData = this.parseReferencesFromApiResponse(
      this.allResponses.analysisData
    );
  }

  /**
   * Organizes chart options by company and quarter for structured display
   */
  organizeChartsByCompanyAndQuarter(
    chartOptions: CompanyChartOption[] | string
  ): CompanyQuarterCharts[] | null {
    if (typeof chartOptions === 'string' || !chartOptions || chartOptions.length === 0) {
      return null;
    }

    // Group by company
    const companyMap = new Map<string, Map<string, CompanyChartOption[]>>();

    chartOptions.forEach(chart => {
      if (!companyMap.has(chart.companyName)) {
        companyMap.set(chart.companyName, new Map());
      }

      const quarterMap = companyMap.get(chart.companyName)!;
      if (!quarterMap.has(chart.period)) {
        quarterMap.set(chart.period, []);
      }

      quarterMap.get(chart.period)!.push(chart);
    });

    // Convert to structured format
    const result: CompanyQuarterCharts[] = [];

    companyMap.forEach((quarterMap, companyName) => {
      const quarters: CompanyQuarterCharts['quarters'] = [];

      // Sort quarters chronologically
      const sortedQuarters = Array.from(quarterMap.keys()).sort((a, b) => {
        const [qA, yA] = a.split(' ');
        const [qB, yB] = b.split(' ');
        const yearDiff = parseInt(yA) - parseInt(yB);
        if (yearDiff !== 0) return yearDiff;
        return parseInt(qA.replace('Q', '')) - parseInt(qB.replace('Q', ''));
      });

      sortedQuarters.forEach(period => {
        const charts:any = quarterMap.get(period)!;
        const filingDate = charts[0]?.chartOption?.title?.subtext || '';

        quarters.push({
          period,
          filingDate,
          charts: charts.sort((a:any, b:any) => {
            // Sort by metric name, then by segment category
            if (a.metricName !== b.metricName) {
              return a.metricName.localeCompare(b.metricName);
            }
            return (a.segmentCategory || '').localeCompare(b.segmentCategory || '');
          })
        });
      });

      result.push({
        companyName,
        cik: quarters[0]?.charts[0]?.cik || '',
        quarters
      });
    });

    return result;
  }

  /**
   * Determines if the query is requesting a segment/breakdown view
   */
  isSegmentBreakdownRequest(query: string, requestedMetrics: string[]): boolean {
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
      'mix'
    ];

    const lowerQuery = query.toLowerCase();
    const hasBreakdownKeyword = breakdownKeywords.some(keyword => 
      lowerQuery.includes(keyword)
    );

    const metricsWithBreakdowns = ['revenue', 'sales', 'income'];
    const hasBreakdownMetric = requestedMetrics?.some(metric =>
      metricsWithBreakdowns.some(bm => metric.toLowerCase().includes(bm))
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
   * Enhanced parser for quarter and segment-wise pie charts
   * Generates pie chart data for EACH company, EACH quarter, EACH metric, and EACH segment
   */
  parseFinancialDataForQuarterSegmentPieCharts(
    apiResponse: APIResponse,
    requestedMetrics?: string[]
  ): SegmentPieChartData[] | string {
    if (!apiResponse || !apiResponse.success) {
      return 'No data available - API request was not successful';
    }

    if (!apiResponse.results || apiResponse.results.length === 0) {
      return 'No data available - No company results found';
    }

    const segmentChartsData: SegmentPieChartData[] = [];

    // Process each company in the results
    for (const company of apiResponse.results) {
      if (!company.statements || company.statements.length === 0) {
        continue;
      }

      // Process EACH statement (quarter) separately
      for (const statement of company.statements) {
        // Iterate through all metrics in the statement
        for (const [metricKey, metricValue] of Object.entries(statement.metrics)) {
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

          // Only process metrics that have children (breakdown data)
          if (metricValue.children && Object.keys(metricValue.children).length > 0) {
            // Process each segment category
            for (const [segmentCategory, segmentItems] of Object.entries(
              metricValue.children
            )) {
              const pieChartPoints: PieChartDataPoint[] = [];

              // Extract each segment item for the pie chart
              for (const [segmentKey, segmentValue] of Object.entries(
                segmentItems as unknown as Record<string, MetricChild>
              )) {
                pieChartPoints.push({
                  name: segmentValue.description || segmentKey.replace(/_/g, ' '),
                  value: segmentValue.value,
                  percentage: segmentValue.percentage_of_parent,
                  formattedValue: this.formatCurrency(segmentValue.value),
                });
              }

              // Only add if we have valid data points
              if (pieChartPoints.length > 0) {
                segmentChartsData.push({
                  companyName: statement.metadata.company_name,
                  cik: company.cik,
                  period: statement.period,
                  filingDate: statement.metadata.filing_date,
                  metricName: cleanName,
                  segmentCategory: segmentCategory.replace(/_/g, ' '),
                  totalValue: metricValue.value,
                  data: pieChartPoints.sort((a, b) => b.percentage - a.percentage),
                });
              }
            }
          }
        }
      }
    }

    if (segmentChartsData.length === 0) {
      return 'No data available - No metrics with segment breakdown data found';
    }

    return segmentChartsData;
  }

  /**
   * Legacy method - kept for backward compatibility but not used in new flow
   */
  parseFinancialDataForMultiQuarterPieCharts(
    apiResponse: APIResponse,
    requestedMetrics?: string[]
  ): SegmentPieChartData[] | string {
    return this.parseFinancialDataForQuarterSegmentPieCharts(apiResponse, requestedMetrics);
  }

  parseFinancialDataForPieCharts(
    apiResponse: APIResponse
  ): CompanyPieChartData[] | string {
    if (!apiResponse || !apiResponse.success) {
      return 'No data available - API request was not successful';
    }

    if (!apiResponse.results || apiResponse.results.length === 0) {
      return 'No data available - No company results found';
    }

    const companiesData: CompanyPieChartData[] = [];

    for (const company of apiResponse.results) {
      if (!company.statements || company.statements.length === 0) {
        continue;
      }

      for (const statement of company.statements) {
        const metricsData: MetricPieChartData[] = [];

        for (const [metricKey, metricValue] of Object.entries(
          statement.metrics
        )) {
          if (
            metricValue.children &&
            Object.keys(metricValue.children).length > 0
          ) {
            const pieChartPoints: PieChartDataPoint[] = [];

            for (const [childKey, childValue] of Object.entries(
              metricValue.children
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

            if (pieChartPoints.length > 0) {
              metricsData.push({
                metricName: this.cleanMetricName(metricValue.name),
                totalValue: metricValue.value,
                data: pieChartPoints.sort(
                  (a, b) => b.percentage - a.percentage
                ),
              });
            }
          }
        }

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

    if (companiesData.length === 0) {
      return 'No data available - No metrics with breakdown data found';
    }

    return companiesData;
  }

  parseFinancialDataForBarCharts(
    apiResponse: APIResponse,
    requestedMetrics: string[]
  ): MetricBarChartData[] | string {
    if (!apiResponse || !apiResponse.success) {
      return 'No data available - API request was not successful';
    }

    if (!apiResponse.results || apiResponse.results.length === 0) {
      return 'No data available - No company results found';
    }

    if (apiResponse.results.length === 1) {
      return 'Use pie chart for single company analysis';
    }

    const metricsMap: Map<string, Map<string, Map<string, number>>> = new Map();
    const allQuarters = new Set<string>();
    const allCompanies = new Set<string>();

    for (const company of apiResponse.results) {
      if (!company.statements || company.statements.length === 0) {
        continue;
      }

      for (const statement of company.statements) {
        const quarter = statement.period;
        const companyName = statement.metadata.company_name;
        
        allQuarters.add(quarter);
        allCompanies.add(companyName);

        for (const [metricKey, metricValue] of Object.entries(
          statement.metrics
        )) {
          const cleanName = this.cleanMetricName(metricValue.name);

          if (requestedMetrics && requestedMetrics.length > 0) {
            const isRequested = requestedMetrics.some(
              (rm) =>
                rm.toLowerCase().replace(/[^a-z0-9]/g, '') ===
                cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')
            );
            if (!isRequested) continue;
          }

          if (!metricsMap.has(cleanName)) {
            metricsMap.set(cleanName, new Map());
          }

          const quarterMap = metricsMap.get(cleanName)!;
          if (!quarterMap.has(quarter)) {
            quarterMap.set(quarter, new Map());
          }

          quarterMap.get(quarter)!.set(companyName, metricValue.value);
        }
      }
    }

    const barChartData: MetricBarChartData[] = [];

    metricsMap.forEach((quarterMap, metricName) => {
      const sortedQuarters = Array.from(allQuarters).sort((a, b) => {
        const [qA, yA] = a.split(' ');
        const [qB, yB] = b.split(' ');
        const yearDiff = parseInt(yA) - parseInt(yB);
        if (yearDiff !== 0) return yearDiff;
        return parseInt(qA.replace('Q', '')) - parseInt(qB.replace('Q', ''));
      });

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
      return parsedData;
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

  processDataForComparison() {
    this.companies = [
      ...new Set(this.cardData.map((item) => item.companyName)),
    ];

    if (this.companies.length > 4) {
      console.warn('More than 4 companies detected. Only showing first 4.');
      this.companies = this.companies.slice(0, 4);
    }

    const uniqueMetrics = [
      ...new Set(this.cardData.map((item) => item.metricName)),
    ];

    this.comparisonMetrics = uniqueMetrics.map((metricName) => {
      const companiesData: ComparisonMetric['companies'] = {};

      const firstMetric = this.cardData.find(
        (item) => item.metricName === metricName
      );
      const subTitle = firstMetric?.subTitle || null;
      const formula = firstMetric?.formula || null;

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

  populateCardData(apiResponse: any, requestedMetrics: string[]): any[] {
    const cardData: any[] = [];

    if (!apiResponse?.success || !apiResponse?.results?.length) {
      return cardData;
    }

    apiResponse.results.forEach((company: any) => {
      const latestStatement = company.statements[0];
      const previousStatement = company.statements[1];

      if (!latestStatement) return;

      const formatCurrency = (value: number): string => {
        const absValue = Math.abs(value);
        if (absValue >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
        if (absValue >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
        return `$${value.toFixed(2)}`;
      };

      const formatPercentage = (value: number): string =>
        `${value.toFixed(1)}%`;

      const getGrowth = (metricKey: string): number | null => {
        const current = latestStatement.metrics[metricKey];
        if (current?.yoy_growth != null) return current.yoy_growth;
        if (current?.qoq_growth != null) return current.qoq_growth;

        if (previousStatement?.metrics[metricKey]) {
          const prev = previousStatement.metrics[metricKey].value;
          if (prev !== 0) {
            return ((current.value - prev) / Math.abs(prev)) * 100;
          }
        }
        return null;
      };

      const metricNames: Record<
        string,
        { name: string; subTitle: string | null }
      > = {
        revenue: { name: 'Revenue', subTitle: null },
        net_income: { name: 'Net Income', subTitle: null },
        gross_profit: { name: 'Gross Profit', subTitle: null },
        operating_income: { name: 'Operating Income', subTitle: null },
        eps_diluted: { name: 'EPS (Diluted)', subTitle: 'Earnings Per Share' },
        cash_equivalents: { name: 'Cash & Cash Equivalents', subTitle: null },
        research_and_development: {
          name: 'R&D Expenses',
          subTitle: 'Research & Development',
        },
        total_assets: { name: 'Total Assets', subTitle: null },
        free_cash_flow: { name: 'Free Cash Flow', subTitle: null },
      };

      Object.keys(latestStatement.metrics).forEach((metricKey) => {
        const metric = latestStatement.metrics[metricKey];
        const config = metricNames[metricKey];

        if (!config) return;

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

        cardData.push({
          companyName: company.company_name,
          metricName: config.name,
          subTitle: config.subTitle,
          metric: formatCurrency(metric.value),
          metricPeriod: latestStatement.period,
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

      if (
        latestStatement.metrics.revenue &&
        latestStatement.metrics.gross_profit
      ) {
        const margin =
          (latestStatement.metrics.gross_profit.value /
            latestStatement.metrics.revenue.value) *
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
          requestedMetrics.some((m) => m.toLowerCase().includes('margin'))
        ) {
          cardData.push({
            companyName: company.company_name,
            metricName: 'Gross Margin',
            subTitle: null,
            metric: formatPercentage(margin),
            metricPeriod: latestStatement.period,
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
          });
        }
      }
    });

    return cardData;
  }

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
   * Creates pie chart options for quarter and segment-wise data
   * Each chart represents one company, one quarter, one metric, one segment category
   */
  createQuarterSegmentPieChartOptions(
    parsedData: SegmentPieChartData[] | string
  ): CompanyChartOption[] | string {
    if (typeof parsedData === 'string') {
      return parsedData;
    }

    if (!parsedData || parsedData.length === 0) {
      return 'No data available to create charts';
    }

    const chartOptions: CompanyChartOption[] = [];

    for (const segmentData of parsedData) {
      if (!segmentData.data || segmentData.data.length === 0) {
        continue;
      }

      const { formatter, divisor } = this.getUnitFormatter(segmentData.data);

      const chartData = segmentData.data.map((point) => ({
        value: parseFloat((point.value / divisor).toFixed(2)),
        name: point.name,
      }));

      const chartOption: EChartsOption = {
        ...this.baseDarkChartTheme,
        title: {
          ...this.baseDarkChartTheme.title,
          text: `${segmentData.metricName} - ${segmentData.segmentCategory}`,
          subtext: `${segmentData.period} | ${segmentData.filingDate}`,
          left: 'center',
          textStyle: {
            color: '#e5e5e5',
            fontSize: 14,
            fontWeight: 600,
          },
          subtextStyle: {
            color: '#888',
            fontSize: 11,
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
            name: `${segmentData.companyName} - ${segmentData.metricName}`,
            type: 'pie',
            radius: '60%',
            center: ['50%', '45%'],
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

      chartOptions.push({
        companyName: segmentData.companyName,
        cik: segmentData.cik,
        period: segmentData.period,
        metricName: segmentData.metricName,
        segmentCategory: segmentData.segmentCategory,
        chartOption: chartOption,
      });
    }

    if (chartOptions.length === 0) {
      return 'No valid charts could be created from the data';
    }

    return chartOptions;
  }

  /**
   * Legacy method - creates multi-quarter pie chart options
   */
  createMultiQuarterPieChartOptions(
    parsedData: SegmentPieChartData[] | string
  ): CompanyChartOption[] | string {
    return this.createQuarterSegmentPieChartOptions(parsedData);
  }

  createPieChartOptions(
    parsedData: CompanyPieChartData[] | string
  ): CompanyChartOption[] | string {
    if (typeof parsedData === 'string') {
      return parsedData;
    }

    if (!parsedData || parsedData.length === 0) {
      return 'No data available to create charts';
    }

    const chartOptions: CompanyChartOption[] = [];

    for (const company of parsedData) {
      for (const metric of company.metrics) {
        if (!metric.data || metric.data.length === 0) {
          continue;
        }

        const { formatter, divisor } = this.getUnitFormatter(metric.data);

        const chartData = metric.data.map((point) => ({
          value: parseFloat((point.value / divisor).toFixed(2)),
          name: point.name,
        }));

        const chartOption: EChartsOption = {
          ...this.baseDarkChartTheme,
          title: {
            ...this.baseDarkChartTheme.title,
            text: '',
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
    if (typeof parsedData === 'string') {
      return parsedData;
    }

    if (!parsedData || parsedData.length === 0) {
      return 'No data available to create charts';
    }

    const chartOptions: CompanyChartOption[] = [];

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

    for (const metric of parsedData) {
      if (!metric.data || metric.data.length === 0) {
        continue;
      }

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

      const dataByQuarter: Map<string, Map<string, number>> = new Map();

      metric.data.forEach((point) => {
        const quarter = point.quarter || 'Unknown';
        if (!dataByQuarter.has(quarter)) {
          dataByQuarter.set(quarter, new Map());
        }
        dataByQuarter.get(quarter)!.set(point.companyName, point.value / divisor);
      });

      const series: any[] = [];

      metric.companies.forEach((companyName, index) => {
        const companyData: number[] = [];

        metric.quarters.forEach((quarter) => {
          const quarterData = dataByQuarter.get(quarter);
          const value = quarterData?.get(companyName);
          companyData.push(value !== undefined ? parseFloat(value.toFixed(2)) : 0);
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
            show: false,
          },
        });
      });

      const chartOption: EChartsOption = {
        ...this.baseDarkChartTheme,
        title: {
          ...this.baseDarkChartTheme.title,
          text: '',
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

      chartOptions.push({
        companyName: 'Multiple Companies',
        cik: 'comparison',
        period: `${metric.quarters[0]} - ${metric.quarters[metric.quarters.length - 1]}`,
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

    const lowerCaseMetrics = metricNames.map((name) => name.toLowerCase());

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
    if (!apiResponse || !apiResponse.success || !apiResponse.results) {
      return [];
    }

    const referencesData: referenceData[] = [];

    apiResponse.results.forEach((result: any) => {
      if (!result.statements || result.statements.length === 0) {
        return;
      }

      const secFilingReferences: references[] = [];
      const websiteReferences: references[] = [];
      const companyName = result.company_name || 'Unknown Company';

      result.statements.forEach((statement: any) => {
        if (statement.metadata) {
          const metadata = statement.metadata;

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

      if (secFilingReferences.length > 0) {
        websiteReferences.push({
          logo: 'pi pi-book',
          link: 'https://www.sec.gov/edgar',
          label: 'SEC EDGAR Database',
        });
      }

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

      if (sections.length > 0) {
        referencesData.push({
          companyName: companyName,
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
}