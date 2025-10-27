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

@Component({
  selector: 'app-accordian',
  imports: [AccordionModule, TagModule, SelectButtonModule, FormsModule, NgbAccordionModule],
  templateUrl: './accordian.component.html',
  styleUrl: './accordian.component.scss',
})
export class AccordianComponent implements OnInit, OnChanges {
  @Input() title: string = 'Chain of Thought Log';
  @Input() apiResponse: ApiResponse | null = null; // New input for API response
  @Input() tabs: tabData[] = []; // Will be populated from API response

  ngOnInit() {
    // If apiResponse is provided, populate tabs
    if (this.apiResponse) {
      this.populateTabsFromApiResponse(this.apiResponse);
    } else if (this.tabs.length === 0) {
      // Use default sample data if no API response and no tabs provided
      // this.tabs = this.getDefaultSampleData();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Re-populate tabs when apiResponse changes
    if (changes['apiResponse'] && changes['apiResponse'].currentValue) {
      this.populateTabsFromApiResponse(changes['apiResponse'].currentValue);
    }
  }

  /**
   * Main function to populate tabs from API response
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
   * Create Revenue Analysis Tab
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
        icon: 'pi pi-exclamation-circle',
        title: 'ChatGPT Discrepancy:',
        message: 'Cannot access real-time SEC filings. Would either: (1) Use training data from months/years ago, leading to outdated/incorrect revenue figures, or (2) Require you to manually find, download, copy-paste or upload the SEC filings. Results would lack filing dates and CIK verification.'
      }
    });

    // Step 2: SEC Database Access
    const filingsList: listItem[] = [];
    companies.forEach(company => {
      company.statements.forEach(statement => {
        filingsList.push({
          itemTitle: `${company.company_name} ${statement.metadata.filing_type} ${statement.period} (Filed: ${this.formatDate(statement.metadata.filing_date)})`,
          itemIcon: 'pi pi-file'
        });
      });
    });

    steps.push({
      title: 'Direct SEC EDGAR database access',
      subTitle: 'Authenticated access to SEC EDGAR API, automatic filing retrieval and XBRL parsing',
      tag: 'unique',
      tagIcon: 'pi pi-sparkles',
      list: [{
        listTitle: 'Direct data sources (no manual input required):',
        listIcon: 'pi pi-database',
        list: filingsList
      }],
      id: 2,
      icon: 'pi pi-verified',
      message: {
        severity: 'warn',
        icon: 'pi pi-exclamation-circle',
        title: 'ChatGPT Discrepancy:',
        message: 'Cannot access real-time SEC filings. Would either: (1) Use training data from months/years ago, leading to outdated/incorrect revenue figures, or (2) Require you to manually find, download, copy-paste or upload the SEC filings. Results would lack filing dates and CIK verification.'
      }
    });

    // Step 3: Data Extraction
    const revenueValues = companies.flatMap(c =>
      c.statements
        .filter(s => s.metrics['revenue'])
        .map(s => this.formatCurrency(s.metrics['revenue'].value))
    );

    steps.push({
      title: 'Structured financial data extraction',
      subTitle: `Parsed XBRL financial statements (revenue values: ${revenueValues.join(', ')}), validated data integrity, extracted revenue line items from consolidated income statements with automatic reconciliation`,
      tag: 'unique',
      tagIcon: 'pi pi-sparkles',
      list: null,
      id: 3,
      icon: 'pi pi-verified',
      message: {
        severity: 'warn',
        icon: 'pi pi-exclamation-circle',
        title: 'ChatGPT Discrepancy:',
        message: 'Cannot access real-time SEC filings. Would either: (1) Use training data from months/years ago, leading to outdated/incorrect revenue figures, or (2) Require you to manually find, download, copy-paste or upload the SEC filings. Results would lack filing dates and CIK verification.'
      }
    });

    // Step 4: Comparative Analysis
    const hasGrowthData = companies.some(c =>
      c.statements.some(s => s.metrics['revenue']?.qoq_growth !== null && s.metrics['revenue']?.qoq_growth !== undefined)
    );

    let growthInfo = '';
    if (hasGrowthData) {
      const growthValues = companies.flatMap(c =>
        c.statements
          .filter(s => s.metrics['revenue']?.qoq_growth !== null && s.metrics['revenue']?.qoq_growth !== undefined)
          .map(s => `${c.company_name}: ${this.formatPercentage(s.metrics['revenue'].qoq_growth!)}`)
      );
      growthInfo = growthValues.length > 0 ? `, quarter-over-quarter growth: ${growthValues.join(', ')}` : '';
    }

    steps.push({
      title: 'Automated comparative analysis',
      subTitle: `Computed quarter-over-quarter growth percentages${growthInfo}, normalized data across different reporting formats, verified calculations against reported figures`,
      tag: 'unique',
      tagIcon: 'pi pi-sparkles',
      list: null,
      id: 4,
      icon: 'pi pi-verified',
      message: {
        severity: 'warn',
        icon: 'pi pi-exclamation-circle',
        title: 'ChatGPT Discrepancy:',
        message: 'Cannot access real-time SEC filings. Would either: (1) Use training data from months/years ago, leading to outdated/incorrect revenue figures, or (2) Require you to manually find, download, copy-paste or upload the SEC filings. Results would lack filing dates and CIK verification.'
      }
    });

    // Step 5: Formula Verification
    steps.push({
      title: 'Formula verification & audit trail',
      subTitle: 'Applied standard accounting formulas, cross-referenced with filed data, generated audit-ready calculation trails with source document links',
      tag: 'unique',
      tagIcon: 'pi pi-sparkles',
      list: null,
      id: 5,
      icon: 'pi pi-verified',
      message: {
        severity: 'warn',
        icon: 'pi pi-exclamation-circle',
        title: 'ChatGPT Discrepancy:',
        message: 'Cannot access real-time SEC filings. Would either: (1) Use training data from months/years ago, leading to outdated/incorrect revenue figures, or (2) Require you to manually find, download, copy-paste or upload the SEC filings. Results would lack filing dates and CIK verification.'
      }
    });

    const uniqueSteps = steps.filter(step => step.tag === 'unique').length;

    return {
      title: `Analyzing revenue data for ${companies.map(c => c.company_name).join(' and ')} (${periodRange})`,
      icon: 'pi pi-check-circle',
      subTitle: `Processing Steps: ${uniqueSteps} unique to this system`,
      value: 0,
      steps
    };
  }

  /**
   * Create Geographic Analysis Tab
   */
  private createGeographicAnalysisTab(companies: CompanyResult[], periodRange: string): tabData | null {
    // Check if we have geographic revenue data
    const hasGeoData = companies.some(c =>
      c.statements.some(s => {
        const revenue = s.metrics['revenue'];
        return revenue?.children && Object.keys(revenue.children).some(key =>
          ['Americas', 'Europe', 'Asia', 'Greater China', 'Japan', 'Rest of Asia Pacific'].includes(key)
        );
      })
    );

    if (!hasGeoData) return null;

    const companiesText = companies.map(c => `${c.company_name} (CIK: ${c.cik})`).join(', ');
    const steps: steps[] = [];

    // Step 1: Query Parsing
    steps.push({
      title: 'Parsing user query',
      subTitle: `Identified companies: ${companiesText} | Metric: Revenue | Timeframe: ${periodRange}`,
      tag: null,
      tagIcon: 'pi pi-sparkles',
      list: null,
      id: 1,
      icon: 'pi pi-verified',
      message: {
        severity: 'warn',
        icon: 'pi pi-exclamation-circle',
        title: 'ChatGPT Discrepancy:',
        message: 'Cannot access real-time SEC filings. Would either: (1) Use training data from months/years ago, leading to outdated/incorrect revenue figures, or (2) Require you to manually find, download, copy-paste or upload the SEC filings. Results would lack filing dates and CIK verification.'
      }
    });

    // Step 2: Segment Data Extraction
    const segmentFilings: listItem[] = [];
    companies.forEach(company => {
      const latestStatement = company.statements[0];
      if (latestStatement) {
        segmentFilings.push({
          itemTitle: `${company.company_name} ${latestStatement.metadata.filing_type} ${latestStatement.period} - Note: Segment Information and Geographic Data`,
          itemIcon: 'pi pi-file'
        });
      }
    });

    steps.push({
      title: 'Direct SEC segment data extraction',
      subTitle: 'Automatically parsed segment disclosure notes, extracted geographic revenue tables from XBRL taxonomies',
      tag: 'unique',
      tagIcon: 'pi pi-sparkles',
      list: [{
        listTitle: 'Direct data sources (no manual input required):',
        listIcon: 'pi pi-database',
        list: segmentFilings
      }],
      id: 2,
      icon: 'pi pi-verified',
      message: {
        severity: 'warn',
        icon: 'pi pi-exclamation-circle',
        title: 'ChatGPT Discrepancy:',
        message: 'Cannot access real-time SEC filings. Would either: (1) Use training data from months/years ago, leading to outdated/incorrect revenue figures, or (2) Require you to manually find, download, copy-paste or upload the SEC filings. Results would lack filing dates and CIK verification.'
      }
    });

    // Step 3: Cross-company Normalization
    const geoRegions: string[] = [];
    companies.forEach(c => {
      c.statements.forEach(s => {
        if (s.metrics['revenue']?.children) {
          Object.keys(s.metrics['revenue'].children).forEach(key => {
            if (['Americas', 'Europe', 'Asia', 'Greater China', 'Japan', 'Rest of Asia Pacific'].includes(key)) {
              geoRegions.push(key);
            }
          });
        }
      });
    });
    const uniqueRegions = Array.from(new Set(geoRegions));

    steps.push({
      title: 'Cross-company normalization',
      subTitle: `Normalized different geographic categorizations (found regions: ${uniqueRegions.join(', ')}), aligned reporting periods, converted to comparable format`,
      tag: 'unique',
      tagIcon: 'pi pi-sparkles',
      list: null,
      id: 3,
      icon: 'pi pi-verified',
      message: {
        severity: 'warn',
        icon: 'pi pi-exclamation-circle',
        title: 'ChatGPT Discrepancy:',
        message: 'Cannot access real-time SEC filings. Would either: (1) Use training data from months/years ago, leading to outdated/incorrect revenue figures, or (2) Require you to manually find, download, copy-paste or upload the SEC filings. Results would lack filing dates and CIK verification.'
      }
    });

    // Step 4: Visualization Preparation
    steps.push({
      title: 'Visualization-ready data preparation',
      subTitle: 'Structured data for comparative charts, calculated regional percentages, validated totals reconcile to consolidated revenue',
      tag: 'unique',
      tagIcon: 'pi pi-sparkles',
      list: null,
      id: 4,
      icon: 'pi pi-verified',
      message: {
        severity: 'warn',
        icon: 'pi pi-exclamation-circle',
        title: 'ChatGPT Discrepancy:',
        message: 'Cannot access real-time SEC filings. Would either: (1) Use training data from months/years ago, leading to outdated/incorrect revenue figures, or (2) Require you to manually find, download, copy-paste or upload the SEC filings. Results would lack filing dates and CIK verification.'
      }
    });

    const uniqueSteps = steps.filter(step => step.tag === 'unique').length;

    return {
      title: `Analyzing revenue breakdown by geographic region for ${companies.map(c => c.company_name).join(' and ')}`,
      icon: 'pi pi-check-circle',
      subTitle: `Processing Steps: ${uniqueSteps} unique to this system`,
      value: 0,
      steps
    };
  }

  /**
   * Create Segment Analysis Tab
   */
  private createSegmentAnalysisTab(companies: CompanyResult[], periodRange: string): tabData | null {
    // Check if we have segment data (non-geographic)
    const hasSegmentData = companies.some(c =>
      c.statements.some(s => s.metrics['revenue']?.has_segments === true)
    );

    if (!hasSegmentData) return null;

    const companiesText = companies.map(c => `${c.company_name} (CIK: ${c.cik})`).join(', ');
    const steps: steps[] = [];

    steps.push({
      title: 'Parsing business segment query',
      subTitle: `Identified companies: ${companiesText} | Analysis: Business segment revenue | Timeframe: ${periodRange}`,
      tag: null,
      tagIcon: 'pi pi-sparkles',
      list: null,
      id: 1,
      icon: 'pi pi-verified',
      message: {
        severity: 'warn',
        icon: 'pi pi-exclamation-circle',
        title: 'ChatGPT Discrepancy:',
        message: 'Cannot access real-time SEC filings or segment data. Would require manual extraction from financial reports.'
      }
    });

    // Extract segment information
    const segmentInfo: string[] = [];
    companies.forEach(c => {
      c.statements.forEach(s => {
        if (s.analysis) {
          Object.keys(s.analysis).forEach(key => {
            if (key.includes('revenue_') && s.analysis![key].has_segments) {
              const segmentName = key.replace('revenue_', '').replace(/_/g, ' ');
              segmentInfo.push(segmentName);
            }
          });
        }
      });
    });

    steps.push({
      title: 'Business segment identification and extraction',
      subTitle: `Extracted segment revenue data from financial statements${segmentInfo.length > 0 ? `: ${Array.from(new Set(segmentInfo)).join(', ')}` : ''}`,
      tag: 'unique',
      tagIcon: 'pi pi-sparkles',
      list: null,
      id: 2,
      icon: 'pi pi-verified',
      message: {
        severity: 'warn',
        icon: 'pi pi-exclamation-circle',
        title: 'ChatGPT Discrepancy:',
        message: 'Cannot access real-time SEC filings or segment data. Would require manual extraction from financial reports.'
      }
    });

    steps.push({
      title: 'Segment performance analysis',
      subTitle: 'Calculated segment contribution percentages, identified growth trends across business units, normalized for cross-company comparison',
      tag: 'unique',
      tagIcon: 'pi pi-sparkles',
      list: null,
      id: 3,
      icon: 'pi pi-verified',
      message: {
        severity: 'warn',
        icon: 'pi pi-exclamation-circle',
        title: 'ChatGPT Discrepancy:',
        message: 'Cannot access real-time SEC filings or segment data. Would require manual extraction from financial reports.'
      }
    });

    const uniqueSteps = steps.filter(step => step.tag === 'unique').length;

    return {
      title: `Analyzing business segment revenue breakdown for ${companies.map(c => c.company_name).join(' and ')}`,
      icon: 'pi pi-check-circle',
      subTitle: `Processing Steps: ${uniqueSteps} unique to this system`,
      value: 0,
      steps
    };
  }

  /**
   * Create Product Mix Analysis Tab
   */
  private createProductMixAnalysisTab(companies: CompanyResult[], periodRange: string): tabData | null {
    // Check if we have product/service breakdown
    const hasProductData = companies.some(c =>
      c.statements.some(s => {
        const revenue = s.metrics['revenue'];
        return revenue?.children && Object.keys(revenue.children).some(key =>
          ['Product', 'Service', 'I Phone', 'Mac', 'I Pad', 'Wearables Homeand Accessories'].some(p => key.includes(p))
        );
      })
    );

    if (!hasProductData) return null;

    const steps: steps[] = [];
    const companiesText = companies.map(c => c.company_name).join(' and ');

    steps.push({
      title: 'Product and service revenue analysis',
      subTitle: `Analyzing product/service mix for ${companiesText} across ${periodRange}`,
      tag: null,
      tagIcon: 'pi pi-sparkles',
      list: null,
      id: 1,
      icon: 'pi pi-verified',
      message: {
        severity: 'warn',
        icon: 'pi pi-exclamation-circle',
        title: 'ChatGPT Discrepancy:',
        message: 'Cannot access real-time product revenue breakdowns. Would use outdated data or require manual input.'
      }
    });

    // Extract product information
    const products: string[] = [];
    companies.forEach(c => {
      c.statements.forEach(s => {
        if (s.metrics['revenue']?.children) {
          Object.keys(s.metrics['revenue'].children).forEach(key => {
            if (['Product', 'Service', 'I Phone', 'Mac', 'I Pad', 'Wearables Homeand Accessories'].some(p => key.includes(p))) {
              products.push(key);
            }
          });
        }
      });
    });
    const uniqueProducts = Array.from(new Set(products));

    steps.push({
      title: 'Product line revenue extraction',
      subTitle: `Identified product categories: ${uniqueProducts.join(', ')}, extracted revenue contribution for each category`,
      tag: 'unique',
      tagIcon: 'pi pi-sparkles',
      list: null,
      id: 2,
      icon: 'pi pi-verified',
      message: {
        severity: 'warn',
        icon: 'pi pi-exclamation-circle',
        title: 'ChatGPT Discrepancy:',
        message: 'Cannot access real-time product revenue breakdowns. Would use outdated data or require manual input.'
      }
    });

    steps.push({
      title: 'Product mix trend analysis',
      subTitle: 'Calculated percentage contribution of each product line, identified shifts in revenue composition, compared product vs. service revenue trends',
      tag: 'unique',
      tagIcon: 'pi pi-sparkles',
      list: null,
      id: 3,
      icon: 'pi pi-verified',
      message: {
        severity: 'warn',
        icon: 'pi pi-exclamation-circle',
        title: 'ChatGPT Discrepancy:',
        message: 'Cannot access real-time product revenue breakdowns. Would use outdated data or require manual input.'
      }
    });

    const uniqueSteps = steps.filter(step => step.tag === 'unique').length;

    return {
      title: `Analyzing product and service revenue mix for ${companiesText}`,
      icon: 'pi pi-check-circle',
      subTitle: `Processing Steps: ${uniqueSteps} unique to this system`,
      value: 0,
      steps
    };
  }

  /**
   * Create Growth Metrics Tab
   */
  private createGrowthMetricsTab(companies: CompanyResult[], periodRange: string): tabData | null {
    // Check if we have growth data
    const hasGrowthData = companies.some(c =>
      c.statements.some(s => s.analysis && Object.values(s.analysis).some(metric => metric.qoq_growth !== null))
    );

    if (!hasGrowthData) return null;

    const steps: steps[] = [];
    const companiesText = companies.map(c => c.company_name).join(' and ');

    steps.push({
      title: 'Growth metrics computation',
      subTitle: `Computing quarter-over-quarter growth for ${companiesText} across all key financial metrics`,
      tag: null,
      tagIcon: 'pi pi-sparkles',
      list: null,
      id: 1,
      icon: 'pi pi-verified',
      message: {
        severity: 'warn',
        icon: 'pi pi-exclamation-circle',
        title: 'ChatGPT Discrepancy:',
        message: 'Cannot compute accurate growth metrics without access to sequential quarterly data from SEC filings.'
      }
    });

    // Identify which metrics have growth data
    const metricsWithGrowth: string[] = [];
    companies.forEach(c => {
      c.statements.forEach(s => {
        if (s.analysis) {
          Object.entries(s.analysis).forEach(([key, value]) => {
            if (value.qoq_growth !== null && value.qoq_growth !== undefined) {
              metricsWithGrowth.push(key.replace(/_/g, ' '));
            }
          });
        }
      });
    });
    const uniqueMetrics = Array.from(new Set(metricsWithGrowth));

    steps.push({
      title: 'Multi-metric growth analysis',
      subTitle: `Calculated growth rates for: ${uniqueMetrics.slice(0, 5).join(', ')}${uniqueMetrics.length > 5 ? ` and ${uniqueMetrics.length - 5} more metrics` : ''}`,
      tag: 'unique',
      tagIcon: 'pi pi-sparkles',
      list: null,
      id: 2,
      icon: 'pi pi-verified',
      message: {
        severity: 'warn',
        icon: 'pi pi-exclamation-circle',
        title: 'ChatGPT Discrepancy:',
        message: 'Cannot compute accurate growth metrics without access to sequential quarterly data from SEC filings.'
      }
    });

    steps.push({
      title: 'Growth trend identification',
      subTitle: 'Identified accelerating and decelerating metrics, compared growth rates across companies, highlighted significant variances',
      tag: 'unique',
      tagIcon: 'pi pi-sparkles',
      list: null,
      id: 3,
      icon: 'pi pi-verified',
      message: {
        severity: 'warn',
        icon: 'pi pi-exclamation-circle',
        title: 'ChatGPT Discrepancy:',
        message: 'Cannot compute accurate growth metrics without access to sequential quarterly data from SEC filings.'
      }
    });

    const uniqueSteps = steps.filter(step => step.tag === 'unique').length;

    return {
      title: `Analyzing growth metrics and trends for ${companiesText}`,
      icon: 'pi pi-check-circle',
      subTitle: `Processing Steps: ${uniqueSteps} unique to this system`,
      value: 0,
      steps
    };
  }

  /**
   * Helper function to format currency
   */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2
    }).format(value);
  }

  /**
   * Helper function to format percentages
   */
  private formatPercentage(value: number): string {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  }

  /**
   * Helper function to format dates
   */
  private formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  }

  /**
   * Default sample data (your original data)
   */
  private getDefaultSampleData(): tabData[] {
    return [
      {
        title: 'Analyzing revenue data for Apple and Microsoft (Q3 2024 - Q4 2024)',
        icon: 'pi pi-check-circle',
        subTitle: 'Processing Steps: 4 unique to this system',
        value: 0,
        steps: [
          {
            title: 'Parsing user query with financial context',
            subTitle:
              'Identified companies: Apple (CIK: 320193), Microsoft (CIK: 789019) | Metric: Revenue | Timeframe: Last 2 quarters',
            tag: null,
            tagIcon: 'pi pi-sparkles',
            list: null,
            id: 1,
            icon: 'pi pi-verified',
            message: {
              severity: 'warn',
              icon: "pi pi-exclamation-circle",
              title: "ChatGPT Discrepancy:",
              message: "Cannot access real-time SEC filings. Would either: (1) Use training data from months/years ago, leading to outdated/incorrect revenue figures (e.g., might report Q2 2024 data when you asked for Q4 2024), or (2) Require you to manually find, download, copy-paste or upload the SEC filings. Results would lack filing dates and CIK verification."
            }
          },
          {
            title: 'Direct SEC EDGAR database access',
            subTitle:
              'Authenticated access to SEC EDGAR API, automatic filing retrieval and XBRL parsing',
            tag: 'unique',
            tagIcon: 'pi pi-sparkles',
            list: [
              {
                listTitle: 'Direct data sources (no manual input required):',
                listIcon: 'pi pi-database',
                list: [
                  {
                    itemTitle: 'Apple Inc. 10-Q Q4 2024 (Filed: Nov 2024)',
                    itemIcon: 'pi pi-file',
                  },
                  {
                    itemTitle: 'Apple Inc. 10-Q Q3 2024 (Filed: Aug 2024)',
                    itemIcon: 'pi pi-file',
                  },
                  {
                    itemTitle: 'Microsoft Corp. 10-Q Q4 2024 (Filed: Oct 2024)',
                    itemIcon: 'pi pi-file',
                  },
                  {
                    itemTitle: 'Microsoft Corp. 10-Q Q3 2024 (Filed: Jul 2024)',
                    itemIcon: 'pi pi-file',
                  },
                ],
              },
            ],
            id: 2,
            icon: 'pi pi-verified',
            message: {
              severity: 'warn',
              icon: "pi pi-exclamation-circle",
              title: "ChatGPT Discrepancy:",
              message: "Cannot access real-time SEC filings. Would either: (1) Use training data from months/years ago, leading to outdated/incorrect revenue figures (e.g., might report Q2 2024 data when you asked for Q4 2024), or (2) Require you to manually find, download, copy-paste or upload the SEC filings. Results would lack filing dates and CIK verification."
            }
          },
          {
            title: 'Structured financial data extraction',
            subTitle:
              `Parsed XBRL financial statements, validated data integrity, extracted revenue line items from consolidated income statements with automatic reconciliation`,
            tag: 'unique',
            tagIcon: 'pi pi-sparkles',
            list: null,
            id: 4,
            icon: 'pi pi-verified',
            message: {
              severity: 'warn',
              icon: "pi pi-exclamation-circle",
              title: "ChatGPT Discrepancy:",
              message: "Cannot access real-time SEC filings. Would either: (1) Use training data from months/years ago, leading to outdated/incorrect revenue figures (e.g., might report Q2 2024 data when you asked for Q4 2024), or (2) Require you to manually find, download, copy-paste or upload the SEC filings. Results would lack filing dates and CIK verification."
            }
          },
          {
            title: 'Automated comparative analysis',
            subTitle:
              `Computed quarter-over-quarter growth percentages, normalized data across different reporting formats, verified calculations against reported figures`,
            tag: 'unique',
            tagIcon: 'pi pi-sparkles',
            list: null,
            id: 3,
            icon: 'pi pi-verified',
            message: {
              severity: 'warn',
              icon: "pi pi-exclamation-circle",
              title: "ChatGPT Discrepancy:",
              message: "Cannot access real-time SEC filings. Would either: (1) Use training data from months/years ago, leading to outdated/incorrect revenue figures (e.g., might report Q2 2024 data when you asked for Q4 2024), or (2) Require you to manually find, download, copy-paste or upload the SEC filings. Results would lack filing dates and CIK verification."
            }
          },
          {
            title: 'Formula verification & audit trail',
            subTitle:
              `Applied standard accounting formulas, cross-referenced with filed data, generated audit-ready calculation trails with source document links`,
            tag: 'unique',
            tagIcon: 'pi pi-sparkles',
            list: null,
            id: 3,
            icon: 'pi pi-verified',
            message: {
              severity: 'warn',
              icon: "pi pi-exclamation-circle",
              title: "ChatGPT Discrepancy:",
              message: "Cannot access real-time SEC filings. Would either: (1) Use training data from months/years ago, leading to outdated/incorrect revenue figures (e.g., might report Q2 2024 data when you asked for Q4 2024), or (2) Require you to manually find, download, copy-paste or upload the SEC filings. Results would lack filing dates and CIK verification."
            }
          },
        ],
      },
      {
        title: 'Analyzing revenue breakdown by geographic region for Apple and Microsoft',
        icon: 'pi pi-check-circle',
        subTitle: 'Processing Steps: (3 unique to this system)',
        value: 0,
        steps: [
          {
            title: 'Parsing user query',
            subTitle:
              'Identified companies: Apple (CIK: 320193), Microsoft (CIK: 789019) | Metric: Revenue | Timeframe: Last 2 quarters',
            tag: null,
            tagIcon: 'pi pi-sparkles',
            list: null,
            id: 1,
            icon: 'pi pi-verified',
            message: {
              severity: 'warn',
              icon: "pi pi-exclamation-circle",
              title: "ChatGPT Discrepancy:",
              message: "Cannot access real-time SEC filings. Would either: (1) Use training data from months/years ago, leading to outdated/incorrect revenue figures (e.g., might report Q2 2024 data when you asked for Q4 2024), or (2) Require you to manually find, download, copy-paste or upload the SEC filings. Results would lack filing dates and CIK verification."
            }
          },
          {
            title: 'Direct SEC segment data extraction',
            subTitle:
              'Automatically parsed segment disclosure notes, extracted geographic revenue tables from XBRL taxonomies',
            tag: 'unique',
            tagIcon: 'pi pi-sparkles',
            list: [
              {
                listTitle: 'Direct data sources (no manual input required):',
                listIcon: 'pi pi-database',
                list: [
                  {
                    itemTitle: 'Apple Inc. 10-Q Q4 2024 - Note 11: Segment Information and Geographic Data',
                    itemIcon: 'pi pi-file',
                  },
                  {
                    itemTitle: 'Microsoft Corp. 10-Q Q4 2024 - Note 17: Segment Information',
                    itemIcon: 'pi pi-file',
                  },

                ],
              },
            ],
            id: 2,
            icon: 'pi pi-verified',
            message: {
              severity: 'warn',
              icon: "pi pi-exclamation-circle",
              title: "ChatGPT Discrepancy:",
              message: "Cannot access real-time SEC filings. Would either: (1) Use training data from months/years ago, leading to outdated/incorrect revenue figures (e.g., might report Q2 2024 data when you asked for Q4 2024), or (2) Require you to manually find, download, copy-paste or upload the SEC filings. Results would lack filing dates and CIK verification."
            }
          },
          {
            title: 'Cross-company normalization',
            subTitle:
              `Normalized different geographic categorizations (Apple uses 'Greater China' vs Microsoft uses 'Asia Pacific'), aligned reporting periods, converted to comparable format`,
            tag: 'unique',
            tagIcon: 'pi pi-sparkles',
            list: null,
            id: 4,
            icon: 'pi pi-verified',
            message: {
              severity: 'warn',
              icon: "pi pi-exclamation-circle",
              title: "ChatGPT Discrepancy:",
              message: "Cannot access real-time SEC filings. Would either: (1) Use training data from months/years ago, leading to outdated/incorrect revenue figures (e.g., might report Q2 2024 data when you asked for Q4 2024), or (2) Require you to manually find, download, copy-paste or upload the SEC filings. Results would lack filing dates and CIK verification."
            }
          },
          {
            title: 'Visualization-ready data preparation',
            subTitle:
              `Structured data for comparative charts, calculated regional percentages, validated totals reconcile to consolidated revenue`,
            tag: 'unique',
            tagIcon: 'pi pi-sparkles',
            list: null,
            id: 3,
            icon: 'pi pi-verified',
            message: {
              severity: 'warn',
              icon: "pi pi-exclamation-circle",
              title: "ChatGPT Discrepancy:",
              message: "Cannot access real-time SEC filings. Would either: (1) Use training data from months/years ago, leading to outdated/incorrect revenue figures (e.g., might report Q2 2024 data when you asked for Q4 2024), or (2) Require you to manually find, download, copy-paste or upload the SEC filings. Results would lack filing dates and CIK verification."
            }
          },

        ],
      },
    ];
  }
}