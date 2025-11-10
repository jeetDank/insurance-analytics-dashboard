import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {
  exportToExcel(data: any[], filename: string): void {
    // Initialize worksheets
    const companyDetails: any[] = [];
    const metricsDetails: any[] = [];
    const segmentsDetails: any[] = [];
    const insights: any[] = [];

    // Process each company
    data.forEach(company => {
      const companyName = company.company_name || 'Unknown';
      const cik = company.cik || 'N/A';

      // Company Details
      (company.statements || []).forEach((statement:any) => {
        const metadata = statement.metadata || {};
        companyDetails.push({
          CIK: cik,
          Company_Name: companyName,
          Filing_Type: metadata.filing_type || 'N/A',
          Filing_Date: metadata.filing_date || 'N/A',
          Period_End_Date: metadata.period_end_date || 'N/A',
          Accession_Number: metadata.accession_number || 'N/A',
          Filing_URL: metadata.filing_url || 'N/A',
          Fiscal_Quarter: metadata.fiscal_quarter || 'N/A',
          Period_Type: metadata.period_type || 'N/A'
        });

        // Metrics Details
        const metrics = statement.metrics || {};
        Object.keys(metrics).forEach(metricKey => {
          const metric = metrics[metricKey];
          metricsDetails.push({
            Company_Name: companyName,
            Period: statement.period || 'N/A',
            Metric_Name: metric.name || metricKey,
            Value_USD: metric.value != null ? metric.value : 'N/A',
            Description: metric.description || 'N/A',
            Format_Type: metric.format_type || 'N/A',
            Is_Calculated: metric.is_calculated || false
          });
        });

        // Segment Details
        const segmentMetrics = statement.segment_metrics || {};
        Object.keys(segmentMetrics).forEach(segmentKey => {
          const segment = segmentMetrics[segmentKey];
          segmentsDetails.push({
            Company_Name: companyName,
            Period: statement.period || 'N/A',
            Segment_Name: segmentKey.replace(/_/g, ' '),
            Metric_Name: segment.name || segmentKey,
            Value_USD: segment.value != null ? segment.value : 'N/A',
            Percentage_of_Parent: segment.percentage_of_parent != null ? segment.percentage_of_parent : 'N/A',
            Description: segment.description || 'N/A'
          });
        });

        // Dynamic Insights
        this.generateInsights(companyName, statement, metrics, segmentMetrics, insights, data);
      });
    });

    // Create workbook and worksheets
    const wb = XLSX.utils.book_new();
    const wsCompany = XLSX.utils.json_to_sheet(companyDetails);
    const wsMetrics = XLSX.utils.json_to_sheet(metricsDetails);
    const wsSegments = XLSX.utils.json_to_sheet(segmentsDetails);
    const wsInsights = XLSX.utils.json_to_sheet(insights);

    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(wb, wsCompany, 'Company Details');
    XLSX.utils.book_append_sheet(wb, wsMetrics, 'Metrics Details');
    XLSX.utils.book_append_sheet(wb, wsSegments, 'Segments Details');
    XLSX.utils.book_append_sheet(wb, wsInsights, 'Insights');

    // Write to file - CORRECTED LINE
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }

  private generateInsights(companyName: string, statement: any, metrics: any, segmentMetrics: any, insights: any[], allData: any[]): void {
    const period = statement.period || 'N/A';
    const revenue = metrics.revenue?.value;
    const netIncome = metrics.net_income?.value;
    const totalAssets = metrics.total_assets?.value;
    const longTermDebt = metrics.long_term_debt?.value;
    const operatingCashFlow = metrics.operating_cash_flow?.value;
    const capex = metrics.capex?.value;

    // Revenue Analysis
    if (revenue != null) {
      insights.push({
        Company_Name: companyName,
        Period: period,
        Insight_Description: 'Revenue Overview',
        Value_Observation: `Total revenue of $${(revenue / 1e9).toFixed(2)}B in ${period}.`
      });

      // Top Segment Contribution
      const segmentRevenues = Object.values(segmentMetrics)
        .filter((seg: any) => seg.name?.includes('revenue') && seg.value != null)
        .sort((a: any, b: any) => b.value - a.value);
      if (segmentRevenues.length > 0) {
        const topSegment:any = segmentRevenues[0];
        insights.push({
          Company_Name: companyName,
          Period: period,
          Insight_Description: 'Top Revenue Segment',
          Value_Observation: `${topSegment.name.replace(/_/g, ' ')} contributed $${(topSegment.value / 1e9).toFixed(2)}B (${topSegment.percentage_of_parent?.toFixed(2)}% of total revenue).`
        });
      }
    } else {
      insights.push({
        Company_Name: companyName,
        Period: period,
        Insight_Description: 'Missing Data',
        Value_Observation: 'Revenue data unavailable, limiting financial analysis.'
      });
    }

    // Profitability Metrics
    if (netIncome != null && revenue != null && revenue > 0) {
      const netProfitMargin = (netIncome / revenue) * 100;
      const profitabilityLabel = netProfitMargin > 10 ? 'strong' : netProfitMargin > 5 ? 'moderate' : 'weak';
      insights.push({
        Company_Name: companyName,
        Period: period,
        Insight_Description: 'Net Profit Margin',
        Value_Observation: `Net profit margin of ${netProfitMargin.toFixed(2)}% in ${period}, indicating ${profitabilityLabel} profitability.`
      });
    }

    // Asset Utilization
    if (netIncome != null && totalAssets != null && totalAssets > 0) {
      const roa = (netIncome / totalAssets) * 100;
      const roaLabel = roa > 2 ? 'efficient' : roa > 1 ? 'moderate' : 'inefficient';
      insights.push({
        Company_Name: companyName,
        Period: period,
        Insight_Description: 'Return on Assets (ROA)',
        Value_Observation: `ROA of ${roa.toFixed(2)}% in ${period}, reflecting ${roaLabel} asset utilization.`
      });
    }

    // Debt Levels
    if (longTermDebt != null && totalAssets != null && totalAssets > 0) {
      const debtRatio = (longTermDebt / totalAssets) * 100;
      const debtLabel = debtRatio > 10 ? 'high' : debtRatio > 5 ? 'moderate' : 'low';
      insights.push({
        Company_Name: companyName,
        Period: period,
        Insight_Description: 'Debt Levels',
        Value_Observation: `Long-term debt of $${(longTermDebt / 1e9).toFixed(2)}B (${debtRatio.toFixed(2)}% of total assets) in ${period}, indicating ${debtLabel} leverage.`
      });
    }

    // Cash Flow Strength
    if (operatingCashFlow != null && capex != null) {
      const freeCashFlow = operatingCashFlow - Math.abs(capex);
      const fcfLabel = freeCashFlow > 0 ? 'strong' : 'weak';
      insights.push({
        Company_Name: companyName,
        Period: period,
        Insight_Description: 'Free Cash Flow',
        Value_Observation: `Generated $${(freeCashFlow / 1e9).toFixed(2)}B in free cash flow in ${period}, supporting ${fcfLabel} financial flexibility.`
      });
    }

    // Segment Contribution (Net Income)
    const segmentNetIncomes:any = Object.values(segmentMetrics)
      .filter((seg: any) => seg.name?.includes('net_income') && seg.value != null)
      .sort((a: any, b: any) => b.value - a.value);
    if (segmentNetIncomes.length > 0) {
      const topNetIncomeSegment = segmentNetIncomes[0];
      insights.push({
        Company_Name: companyName,
        Period: period,
        Insight_Description: 'Top Net Income Segment',
        Value_Observation: `${topNetIncomeSegment.name.replace(/_/g, ' ')} contributed $${(topNetIncomeSegment.value / 1e9).toFixed(2)}B (${topNetIncomeSegment.percentage_of_parent?.toFixed(2)}% of total net income) in ${period}.`
      });
    } else if (segmentMetrics && Object.keys(segmentMetrics).length > 0) {
      insights.push({
        Company_Name: companyName,
        Period: period,
        Insight_Description: 'Missing Segment Data',
        Value_Observation: 'Segment-level net income data unavailable, limiting segment profitability analysis.'
      });
    }

    // Comparative Insights (if multiple companies)
    if (allData.length > 1) {
      const otherCompanies = allData.filter(c => c.company_name !== companyName);
      otherCompanies.forEach(otherCompany => {
        const otherStatement = otherCompany.statements?.[0];
        const otherRevenue = otherStatement?.metrics?.revenue?.value;
        if (revenue != null && otherRevenue != null) {
          const revenueDiff = ((revenue - otherRevenue) / otherRevenue) * 100;
          const diffLabel = revenueDiff > 0 ? 'higher' : 'lower';
          insights.push({
            Company_Name: `${companyName} vs. ${otherCompany.company_name || 'Unknown'}`,
            Period: period,
            Insight_Description: 'Revenue Comparison',
            Value_Observation: `${companyName}'s revenue of $${(revenue / 1e9).toFixed(2)}B was ${Math.abs(revenueDiff).toFixed(2)}% ${diffLabel} than ${otherCompany.company_name || 'Unknown'}'s $${(otherRevenue / 1e9).toFixed(2)}B in ${period}.`
          });
        }
      });
    }
  }
}