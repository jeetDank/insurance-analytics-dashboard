import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { CustomMessageComponent } from '../custom-message/custom-message.component';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

interface tabData {
  title: string;
  value: number;
  subTitle: string;
  icon: string;
  steps: steps[];
}

interface steps {
  title: string;
  subTitle: string | null;
  tag: string | null;
  list: subList[] | null;
  id: number;
  icon: string | null;
  tagIcon: string | null;
  message: messageDetails | null
}

interface subList {
  listTitle: string | null;
  listIcon: string | null;
  list: listItem[] | null;
}

interface listItem {
  itemTitle: string | null;
  itemIcon: string | null;
}

interface messageDetails {
  severity: string | null;
  icon: string | null;
  title: string | null;
  message: string
}

// API Response interfaces
interface ApiResponse {
  success: boolean;
  results: CompanyResult[];
}

interface CompanyResult {
  cik: string;
  company_name: string;
  statements: Statement[];
}

interface Statement {
  metadata: Metadata;
  context_info: ContextInfo;
  period: string;
  metrics: Record<string, Metric>;
  analysis?: Analysis;
}

interface Metadata {
  cik: string;
  company_name: string;
  filing_type: string;
  filing_date: string;
  period_end_date: string;
  accession_number: string;
  filing_url: string;
}

interface ContextInfo {
  context_id: string;
  entity_identifier: string;
  period_type: string;
  start_date: string | null;
  end_date: string;
  instant_date: string | null;
}

interface Metric {
  name: string;
  value: number;
  concept: string;
  unit: string;
  qoq_growth?: number | null;
  has_segments?: boolean;
  children?: Record<string, MetricChild>;
}

interface MetricChild {
  name: string;
  value: number;
  percentage_of_parent?: number;
}

interface Analysis {
  [key: string]: {
    value: number;
    qoq_growth: number | null;
    has_segments: boolean;
  };
}

// New interfaces for parsedQuery
interface ParsedQuery {
  success: boolean;
  parsed: ParsedData;
  message: string;
  validation: ValidationData;
}

interface ParsedData {
  query_type: string;
  companies: string[];
  metrics: string[];
  time_periods: string[];
  analysis_intent: string;
  calculation_type: string | null;
  comparison_type: string | null;
  ambiguities: any[];
  time_config: TimeConfig;
  segment_filter: SegmentFilter;
  raw_query: string | null;
}

interface TimeConfig {
  reference_date: string;
  period_type: string;
  dynamic_calculation: boolean;
  number_literal_used: any | null;
}

interface SegmentFilter {
  dimension_type: string;
  dimension_values: any[];
}

interface ValidationData {
  is_valid: boolean;
  errors: any[];
}

// New interfaces for CompanyData
interface CompanyDataResponse {
  success: boolean;
  company: CompanyDetails;
  suggestions: any | null;
  message: string;
}

interface CompanyDetails {
  identifiers: CompanyIdentifiers;
  name: string;
  industry_type: string;
  sector: string | null;
  industry: string | null;
  status: string;
  exchange: string | null;
  address: string | null;
  profile: CompanyProfile;
  filing_history: FilingHistory[];
  latest_filing_date: string;
  created_at: string;
  updated_at: string;
  data_sources: string[];
}

interface CompanyIdentifiers {
  cik: string;
  ticker: string | null;
  cusip: string | null;
  isin: string | null;
  lei: string | null;
}

interface CompanyProfile {
  description: string | null;
  website: string | null;
  phone: string | null;
  employee_count: number | null;
  founded_year: number | null;
  fiscal_year_end: string | null;
  market_cap: number | null;
  enterprise_value: number | null;
  shares_outstanding: number | null;
  business_summary: string | null;
  primary_sic_code: string | null;
  sic_description: string | null;
}

interface FilingHistory {
  form_type: string;
  filing_date: string;
  reporting_date: string | null;
  accession_number: string;
  document_url: string | null;
  xbrl_url: string | null;
  file_size: number | null;
}

@Component({
  selector: 'app-accordian',
  imports: [AccordionModule, TagModule, SelectButtonModule, FormsModule, NgbAccordionModule],
  templateUrl: './accordian.component.html',
  styleUrl: './accordian.component.scss',
})
export class AccordianComponent implements OnInit, OnChanges {
  @Input() title: string = 'Chain of Thought Log';
  @Input() apiResponse: ApiResponse | null = null;
  @Input() parsedQuery: ParsedQuery | null = null; // New input for parsed query
  @Input() companyData: CompanyDataResponse[] | null = null; // New input for company data
  @Input() tabs: tabData[] = []; // Will be populated from any of the inputs

  ngOnInit() {
    this.updateTabs();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Re-populate tabs when any input changes
    if (changes['apiResponse'] || changes['parsedQuery'] || changes['companyData']) {
      this.updateTabs();
    }
  }

  /**
   * Main function to determine which data source to use and populate tabs
   */
  private updateTabs(): void {
    if (this.apiResponse) {
      this.populateTabsFromApiResponse(this.apiResponse);
    } else if (this.parsedQuery && this.companyData) {
      this.populateTabsFromParsedQueryAndCompanyData(this.parsedQuery, this.companyData);
    } else if (this.parsedQuery) {
      this.populateTabsFromParsedQuery(this.parsedQuery);
    } else if (this.companyData) {
      this.populateTabsFromCompanyData(this.companyData);
    } else if (this.tabs.length === 0) {
      // No data provided, keep tabs empty
      this.tabs = [];
    }
  }

  /**
   * Populate tabs from ParsedQuery data
   */
  private populateTabsFromParsedQuery(parsedQuery: ParsedQuery): void {
    const tabs: tabData[] = [];

    if (!parsedQuery.success) {
      this.tabs = [];
      return;
    }

    const parsed = parsedQuery.parsed;
    const steps: steps[] = [];

    // Step 1: Query Parsing
    steps.push({
      title: 'Query parsed successfully',
      subTitle: `Type: ${parsed.query_type} | Companies: ${parsed.companies.join(', ')} | Metrics: ${parsed.metrics.join(', ')}`,
      tag: null,
      tagIcon: 'pi pi-sparkles',
      list: null,
      id: 1,
      icon: 'pi pi-verified',
      message: null
    });

    // Step 2: Time Configuration
    if (parsed.time_config) {
      steps.push({
        title: 'Time configuration detected',
        subTitle: `Period Type: ${parsed.time_config.period_type} | Reference Date: ${parsed.time_config.reference_date}`,
        tag: null,
        tagIcon: null,
        list: [
          {
            listTitle: 'Time Period Details:',
            listIcon: 'pi pi-calendar',
            list: parsed.time_periods.map(period => ({
              itemTitle: period,
              itemIcon: 'pi pi-clock'
            }))
          }
        ],
        id: 2,
        icon: 'pi pi-verified',
        message: null
      });
    }

    // Step 3: Segment Filter (if applicable)
    if (parsed.segment_filter && parsed.segment_filter.dimension_type) {
      steps.push({
        title: 'Segment analysis configured',
        subTitle: `Dimension Type: ${parsed.segment_filter.dimension_type}`,
        tag: 'segment',
        tagIcon: 'pi pi-chart-bar',
        list: null,
        id: 3,
        icon: 'pi pi-verified',
        message: null
      });
    }

    // Step 4: Validation Status
    steps.push({
      title: 'Query validation',
      subTitle: parsedQuery.validation.is_valid ? 'Query validated successfully' : 'Validation errors detected',
      tag: parsedQuery.validation.is_valid ? null : 'error',
      tagIcon: parsedQuery.validation.is_valid ? null : 'pi pi-exclamation-triangle',
      list: parsedQuery.validation.errors.length > 0 ? [
        {
          listTitle: 'Validation Errors:',
          listIcon: 'pi pi-exclamation-circle',
          list: parsedQuery.validation.errors.map((error: any) => ({
            itemTitle: typeof error === 'string' ? error : JSON.stringify(error),
            itemIcon: 'pi pi-times-circle'
          }))
        }
      ] : null,
      id: 4,
      icon: parsedQuery.validation.is_valid ? 'pi pi-verified' : 'pi pi-exclamation-triangle',
      message: parsedQuery.validation.errors.length > 0 ? {
        severity: 'error',
        icon: 'pi pi-exclamation-circle',
        title: 'Validation Issues:',
        message: 'Please review the validation errors above'
      } : null
    });

    tabs.push({
      title: `Query Analysis: ${parsed.analysis_intent}`,
      icon: 'pi pi-search',
      subTitle: `Processing Steps: ${steps.length}`,
      value: 0,
      steps: steps
    });

    this.tabs = tabs;
  }

  /**
   * Populate tabs from CompanyData
   */
  private populateTabsFromCompanyData(companyData: CompanyDataResponse[]): void {
    const tabs: tabData[] = [];

    companyData.forEach((companyResponse, index) => {
      if (!companyResponse.success) {
        return;
      }

      const company = companyResponse.company;
      const steps: steps[] = [];

      // Step 1: Company Information
      steps.push({
        title: `Company identified: ${company.name}`,
        subTitle: `CIK: ${company.identifiers.cik} | Industry: ${company.industry_type} | Status: ${company.status}`,
        tag: null,
        tagIcon: null,
        list: null,
        id: 1,
        icon: 'pi pi-building',
        message: null
      });

      // Step 2: Filing History
      const recentFilings = company.filing_history.slice(0, 10);
      steps.push({
        title: 'Filing history retrieved',
        subTitle: `Total filings: ${company.filing_history.length} | Most recent: ${company.latest_filing_date}`,
        tag: null,
        tagIcon: null,
        list: [
          {
            listTitle: 'Recent Filings:',
            listIcon: 'pi pi-file',
            list: recentFilings.map(filing => ({
              itemTitle: `${filing.form_type} - Filed: ${filing.filing_date}`,
              itemIcon: 'pi pi-file-pdf'
            }))
          }
        ],
        id: 2,
        icon: 'pi pi-verified',
        message: null
      });

      // Step 3: Data Sources
      steps.push({
        title: 'Data sources verified',
        subTitle: `Sources: ${company.data_sources.join(', ')}`,
        tag: 'verified',
        tagIcon: 'pi pi-check',
        list: null,
        id: 3,
        icon: 'pi pi-verified',
        message: null
      });

      // Step 4: Company Profile (if available)
      if (company.profile && (company.profile.website || company.profile.employee_count || company.profile.founded_year)) {
        const profileItems: listItem[] = [];
        if (company.profile.website) profileItems.push({ itemTitle: `Website: ${company.profile.website}`, itemIcon: 'pi pi-globe' });
        if (company.profile.employee_count) profileItems.push({ itemTitle: `Employees: ${company.profile.employee_count.toLocaleString()}`, itemIcon: 'pi pi-users' });
        if (company.profile.founded_year) profileItems.push({ itemTitle: `Founded: ${company.profile.founded_year}`, itemIcon: 'pi pi-calendar' });

        if (profileItems.length > 0) {
          steps.push({
            title: 'Company profile details',
            subTitle: 'Additional company information available',
            tag: null,
            tagIcon: null,
            list: [
              {
                listTitle: 'Profile Information:',
                listIcon: 'pi pi-info-circle',
                list: profileItems
              }
            ],
            id: 4,
            icon: 'pi pi-info-circle',
            message: null
          });
        }
      }

      tabs.push({
        title: company.name,
        icon: 'pi pi-building',
        subTitle: `Processing Steps: ${steps.length}`,
        value: index,
        steps: steps
      });
    });

    this.tabs = tabs;
  }

  /**
   * Populate tabs from both ParsedQuery and CompanyData (combined view)
   */
  private populateTabsFromParsedQueryAndCompanyData(parsedQuery: ParsedQuery, companyData: CompanyDataResponse[]): void {
    const tabs: tabData[] = [];

    if (!parsedQuery.success) {
      this.tabs = [];
      return;
    }

    const parsed = parsedQuery.parsed;
    const steps: steps[] = [];

    // Step 1: Query Parsing
    steps.push({
      title: 'Query parsed successfully',
      subTitle: `Type: ${parsed.query_type} | Analysis: ${parsed.analysis_intent}`,
      tag: null,
      tagIcon: 'pi pi-sparkles',
      list: [
        {
          listTitle: 'Query Details:',
          listIcon: 'pi pi-search',
          list: [
            { itemTitle: `Companies: ${parsed.companies.join(', ')}`, itemIcon: 'pi pi-building' },
            { itemTitle: `Metrics: ${parsed.metrics.join(', ')}`, itemIcon: 'pi pi-chart-line' },
            { itemTitle: `Time Periods: ${parsed.time_periods.join(', ')}`, itemIcon: 'pi pi-calendar' }
          ]
        }
      ],
      id: 1,
      icon: 'pi pi-verified',
      message: null
    });

    // Step 2: Company Resolution
    const resolvedCompanies = companyData
      .filter(c => c.success)
      .map(c => c.company);

    if (resolvedCompanies.length > 0) {
      steps.push({
        title: 'Companies resolved',
        subTitle: `Successfully identified ${resolvedCompanies.length} compan${resolvedCompanies.length === 1 ? 'y' : 'ies'}`,
        tag: 'resolved',
        tagIcon: 'pi pi-check',
        list: [
          {
            listTitle: 'Resolved Companies:',
            listIcon: 'pi pi-building',
            list: resolvedCompanies.map(company => ({
              itemTitle: `${company.name} (CIK: ${company.identifiers.cik})`,
              itemIcon: 'pi pi-verified'
            }))
          }
        ],
        id: 2,
        icon: 'pi pi-verified',
        message: null
      });
    }

    // Step 3: Filing Data Retrieved
    const allFilings = resolvedCompanies.flatMap(company => 
      company.filing_history.slice(0, 5).map(filing => ({
        company: company.name,
        formType: filing.form_type,
        filingDate: filing.filing_date
      }))
    );

    if (allFilings.length > 0) {
      steps.push({
        title: 'SEC filing data retrieved',
        subTitle: `Retrieved ${allFilings.length} relevant filings from SEC EDGAR`,
        tag: 'unique',
        tagIcon: 'pi pi-sparkles',
        list: [
          {
            listTitle: 'Recent Filings:',
            listIcon: 'pi pi-file',
            list: allFilings.map(filing => ({
              itemTitle: `${filing.company} - ${filing.formType} (Filed: ${filing.filingDate})`,
              itemIcon: 'pi pi-file-pdf'
            }))
          }
        ],
        id: 3,
        icon: 'pi pi-verified',
        message: null
      });
    }

    // Step 4: Analysis Configuration
    steps.push({
      title: 'Analysis configured',
      subTitle: `${parsed.segment_filter?.dimension_type ? 'Segment analysis' : 'Standard analysis'} ready for execution`,
      tag: null,
      tagIcon: null,
      list: [
        {
          listTitle: 'Configuration:',
          listIcon: 'pi pi-cog',
          list: [
            { itemTitle: `Query Type: ${parsed.query_type}`, itemIcon: 'pi pi-tag' },
            { itemTitle: `Period Type: ${parsed.time_config.period_type}`, itemIcon: 'pi pi-clock' },
            { itemTitle: `Dynamic Calculation: ${parsed.time_config.dynamic_calculation ? 'Yes' : 'No'}`, itemIcon: 'pi pi-calculator' }
          ]
        }
      ],
      id: 4,
      icon: 'pi pi-verified',
      message: null
    });

    tabs.push({
      title: `Financial Analysis: ${parsed.analysis_intent}`,
      icon: 'pi pi-chart-bar',
      subTitle: `Processing Steps: ${steps.length}`,
      value: 0,
      steps: steps
    });

    this.tabs = tabs;
  }

  /**
   * Main function to populate tabs from API response (original functionality)
   */
  private populateTabsFromApiResponse(apiResponse: ApiResponse): void {
    const tabs: tabData[] = [];

    if (!apiResponse.success || !apiResponse.results?.length) {
      this.tabs = [];
      return;
    }

    const companies = apiResponse.results;

    // Get periods for analysis
    const allPeriods = companies.flatMap(c =>
      c.statements.map(s => ({
        period: s.period,
        filingDate: s.metadata.filing_date,
        periodEndDate: s.metadata.period_end_date,
        company: c.company_name
      }))
    );

    const sortedPeriods = allPeriods.sort((a, b) =>
      new Date(b.periodEndDate).getTime() - new Date(a.periodEndDate).getTime()
    );

    const periodRange = sortedPeriods.length > 1
      ? `${sortedPeriods[sortedPeriods.length - 1].period} - ${sortedPeriods[0].period}`
      : sortedPeriods[0]?.period || '';

    // Create tabs based on available data
    const revenueTab = this.createRevenueAnalysisTab(companies, periodRange);
    if (revenueTab) tabs.push(revenueTab);

    const geoTab = this.createGeographicAnalysisTab(companies, periodRange);
    if (geoTab) tabs.push(geoTab);

    const segmentTab = this.createSegmentAnalysisTab(companies, periodRange);
    if (segmentTab) tabs.push(segmentTab);

    const productTab = this.createProductMixAnalysisTab(companies, periodRange);
    if (productTab) tabs.push(productTab);

    const growthTab = this.createGrowthMetricsTab(companies, periodRange);
    if (growthTab) tabs.push(growthTab);

    this.tabs = tabs;
  }

  /**
   * Create Revenue Analysis Tab (original method - kept for compatibility)
   */
  private createRevenueAnalysisTab(companies: CompanyResult[], periodRange: string): tabData | null {
    const companiesText = companies.map(c => `${c.company_name} (CIK: ${c.cik})`).join(', ');

    // Check if we have revenue data
    const hasRevenueData = companies.some(c =>
      c.statements.some(s => s.metrics['revenue'])
    );

    if (!hasRevenueData) return null;

    const steps: steps[] = [];

    // Step 1: Query Parsing
    steps.push({
      title: 'Parsing user query with financial context',
      subTitle: `Identified companies: ${companiesText} | Metric: Revenue | Timeframe: ${periodRange}`,
      tag: null,
      tagIcon: 'pi pi-sparkles',
      list: null,
      id: 1,
      icon: 'pi pi-verified',
      message: {
        severity: 'warn',
        icon: "pi pi-exclamation-circle",
        title: "ChatGPT Discrepancy:",
        message: "Cannot access real-time SEC filings. Would either: (1) Use training data from months/years ago, or (2) Require manual file upload."
      }
    });

    return {
      title: `Analyzing revenue data for ${companies.map(c => c.company_name).join(' and ')} (${periodRange})`,
      icon: 'pi pi-chart-line',
      subTitle: `Processing Steps: ${steps.length}`,
      value: 0,
      steps: steps
    };
  }

  // Placeholder methods (add your original implementations here)
  private createGeographicAnalysisTab(companies: CompanyResult[], periodRange: string): tabData | null {
    return null; // Implement as per your original code
  }

  private createSegmentAnalysisTab(companies: CompanyResult[], periodRange: string): tabData | null {
    return null; // Implement as per your original code
  }

  private createProductMixAnalysisTab(companies: CompanyResult[], periodRange: string): tabData | null {
    return null; // Implement as per your original code
  }

  private createGrowthMetricsTab(companies: CompanyResult[], periodRange: string): tabData | null {
    return null; // Implement as per your original code
  }
}