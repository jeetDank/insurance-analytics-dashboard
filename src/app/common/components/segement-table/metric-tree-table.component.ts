import { Component, input, effect, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule } from '@angular/material/tree';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

// Interface for the metric data structure
export interface MetricNode {
  name: string;
  value: number;
  concept: string;
  unit: string;
  decimals: number;
  context_ref?: string | null;
  is_calculated?: boolean;
  variable_name?: string;
  description?: string | null;
  percentage_of_parent?: number;
  parent_value?: number;
  format_type: string;
  children?: { [key: string]: MetricNode | SegmentGroup };
}

// Interface for segment groups (like "Business Segments", "Consolidation Items")
export interface SegmentGroup {
  [key: string]: MetricNode;
}

// Interface for quarter data
export interface QuarterData {
  quarter: string;
  year: number;
  metrics: { [key: string]: MetricNode };
}

// Interface for company data
export interface CompanyData {
  company_name: string;
  ticker?: string;
  statements: QuarterData[];
}

// Flattened node interface for the tree
interface FlatMetricNode {
  expandable: boolean;
  name: string;
  value?: number;
  percentage_of_parent?: number;
  format_type?: string;
  level: number;
  unit?: string;
  description?: string | null;
  nodeType: 'company' | 'quarter' | 'metric' | 'segment-group' | 'segment';
  isSegmentGroup?: boolean;
}

@Component({
  selector: 'app-metric-tree-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTreeModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSelectModule,
    MatFormFieldModule
  ],
  templateUrl: './metric-tree-table.component.html',
  styleUrl: './metric-tree-table.component.scss'
})
export class MetricTreeTableComponent {
  // Angular 19 input signal for companies data
  companies = input<CompanyData[]>([]);
  
  // Input signal for requested metrics filter
  requestedMetrics = input<string[]>([]);

  // Columns to display in the table
  displayedColumns = signal(['name', 'value', 'percentage', 'unit']);

  // Tree control and data source
  treeControl: FlatTreeControl<FlatMetricNode>;
  treeFlattener: MatTreeFlattener<any, FlatMetricNode>;
  dataSource: MatTreeFlatDataSource<any, FlatMetricNode>;

  constructor() {
    // Initialize tree flattener
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren
    );

    // Initialize tree control
    this.treeControl = new FlatTreeControl(
      this.getLevel,
      this.isExpandable
    );

    // Initialize data source
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );

    // Effect to watch for companies changes
    effect(() => {
      const currentCompanies = this.companies();
      const currentRequestedMetrics = this.requestedMetrics();
      
      if (currentCompanies && currentCompanies.length > 0) {
        this.loadData(currentCompanies, currentRequestedMetrics);
      }
    });
  }

  // Transform nested node to flat node
  private transformer = (node: any, level: number): FlatMetricNode => {
    // Handle company node
    if (node.nodeType === 'company') {
      return {
        expandable: node.statements && node.statements.length > 0,
        name: node.company_name + (node.ticker ? ` (${node.ticker})` : ''),
        level: level,
        nodeType: 'company',
        isSegmentGroup: false
      };
    }

    // Handle quarter node
    if (node.nodeType === 'quarter') {
      return {
        expandable: node.metrics && Object.keys(node.metrics).length > 0,
        name: `${node.quarter} ${node.year}`,
        level: level,
        nodeType: 'quarter',
        isSegmentGroup: false
      };
    }

    // Handle segment group node (like "Business Segments")
    if (node.nodeType === 'segment-group') {
      return {
        expandable: true,
        name: node.name,
        level: level,
        nodeType: 'segment-group',
        isSegmentGroup: true
      };
    }

    // Handle metric node
    return {
      expandable: !!node.children && Object.keys(node.children).length > 0,
      name: node.name,
      value: node.value,
      percentage_of_parent: node.percentage_of_parent,
      format_type: node.format_type,
      level: level,
      unit: node.unit,
      description: node.description,
      nodeType: node.children ? 'metric' : 'segment',
      isSegmentGroup: false
    };
  };

  // Get the level of the node
  private getLevel = (node: FlatMetricNode): number => node.level;

  // Check if node is expandable
  private isExpandable = (node: FlatMetricNode): boolean => node.expandable;

  // Get children of the node - handles all nested structures
  private getChildren = (node: any): any[] => {
    // Company node - return statements as quarters
    if (node.nodeType === 'company') {
      return node.statements.map((statement: QuarterData) => ({
        ...statement,
        nodeType: 'quarter'
      }));
    }

    // Quarter node - return metrics (filtered if requested metrics exist)
    if (node.nodeType === 'quarter') {
      const metricsArray: any[] = [];
      Object.keys(node.metrics).forEach(key => {
        const metric = node.metrics[key];
        metricsArray.push({
          ...metric,
          nodeType: 'metric'
        });
      });
      return metricsArray;
    }

    // Segment group node - return segments
    if (node.nodeType === 'segment-group') {
      const segmentsArray: any[] = [];
      Object.keys(node.segments).forEach(key => {
        const segment = node.segments[key];
        segmentsArray.push({
          ...segment,
          nodeType: 'segment'
        });
      });
      return segmentsArray;
    }

    // Metric or segment node with children
    if (node.children) {
      const childrenArray: any[] = [];
      
      Object.keys(node.children).forEach(key => {
        const child = node.children[key];
        
        // Check if this is a segment group (contains multiple segments)
        // A segment group is identified by having children that are all MetricNodes
        if (this.isSegmentGroup(child)) {
          // This is a segment group (like "Business Segments", "Consolidation Items")
          childrenArray.push({
            name: key,
            nodeType: 'segment-group',
            segments: child
          });
        } else {
          // This is a regular segment/metric
          childrenArray.push({
            ...child,
            nodeType: 'segment'
          });
        }
      });
      
      return childrenArray;
    }

    return [];
  };

  // Helper method to check if an object is a segment group
  private isSegmentGroup(obj: any): boolean {
    if (!obj || typeof obj !== 'object') return false;
    
    // Check if all properties are objects with metric-like properties
    const keys = Object.keys(obj);
    if (keys.length === 0) return false;
    
    // If it has a 'value' property, it's a metric node, not a group
    if ('value' in obj) return false;
    
    // Check if all children have 'value' property (indicating they are metrics)
    return keys.every(key => {
      const child = obj[key];
      return child && typeof child === 'object' && 'value' in child;
    });
  }

  // Check if node has children
  hasChild = (_: number, node: FlatMetricNode): boolean => node.expandable;

  // Helper method to check if a metric should be included based on requested metrics
  private shouldIncludeMetric(metricKey: string, requestedMetrics: string[]): boolean {
    // If no filter is provided, include all metrics
    if (!requestedMetrics || requestedMetrics.length === 0) {
      return true;
    }
    
    // Check if the metric key matches any of the requested metrics
    // Handle both exact matches and variations (e.g., "revenue" matches "revenue_Operatings")
    return requestedMetrics.some(requestedMetric => {
      const normalizedMetricKey = metricKey.toLowerCase();
      const normalizedRequestedMetric = requestedMetric.toLowerCase();
      
      // Exact match
      if (normalizedMetricKey === normalizedRequestedMetric) {
        return true;
      }
      
      // Check if the metric key starts with the requested metric followed by underscore
      // This handles cases like "revenue_Operatings" when filtering for "revenue"
      if (normalizedMetricKey.startsWith(normalizedRequestedMetric + '_')) {
        return true;
      }
      
      return false;
    });
  }

  // Filter metrics based on requested metrics list
  private filterMetrics(metrics: { [key: string]: MetricNode }, requestedMetrics: string[]): { [key: string]: MetricNode } {
    // If no filter is provided, return all metrics
    if (!requestedMetrics || requestedMetrics.length === 0) {
      return metrics;
    }
    
    const filteredMetrics: { [key: string]: MetricNode } = {};
    
    Object.keys(metrics).forEach(key => {
      if (this.shouldIncludeMetric(key, requestedMetrics)) {
        filteredMetrics[key] = metrics[key];
      }
    });
    
    return filteredMetrics;
  }

  // Filter companies data based on requested metrics
  private filterCompaniesData(companies: CompanyData[], requestedMetrics: string[]): CompanyData[] {
    // If no filter is provided, return all companies as-is
    if (!requestedMetrics || requestedMetrics.length === 0) {
      return companies;
    }
    
    return companies.map(company => ({
      ...company,
      statements: company.statements.map(statement => ({
        ...statement,
        metrics: this.filterMetrics(statement.metrics, requestedMetrics)
      })).filter(statement => Object.keys(statement.metrics).length > 0) // Remove quarters with no matching metrics
    })).filter(company => company.statements.length > 0); // Remove companies with no matching quarters
  }

  // Load data from input companies
  private loadData(companies: CompanyData[], requestedMetrics: string[]): void {
    // Filter the companies data based on requested metrics
    const filteredCompanies = this.filterCompaniesData(companies, requestedMetrics);
    
    const companiesArray = filteredCompanies.map(company => ({
      ...company,
      nodeType: 'company'
    }));
    
    this.dataSource.data = companiesArray;
    console.log(companiesArray);
    
  }

  // Format currency values
  formatValue(value?: number, formatType?: string, unit?: string): string {
    if (value === undefined) return '-';
    
    if (formatType === 'currency' && unit) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: unit,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    
    // Handle other format types
    return value.toLocaleString('en-US');
  }

  // Format percentage
  formatPercentage(value?: number): string {
    return value !== undefined ? `${value.toFixed(2)}%` : '-';
  }

  // Get padding for indentation based on level
  getPaddingLeft(level: number): string {
    return `${level * 24}px`;
  }

  // Check if node is a segment group for styling purposes
  isSegmentGroupNode(node: FlatMetricNode): boolean {
    return node.isSegmentGroup === true;
  }

  // Utility methods for expand/collapse
  expandAll(): void {
    this.treeControl.expandAll();
  }

  collapseAll(): void {
    this.treeControl.collapseAll();
  }
  
  // Get count of displayed metrics (useful for showing in UI)
  getDisplayedMetricsCount(): number {
    const requestedMetrics = this.requestedMetrics();
    return requestedMetrics && requestedMetrics.length > 0 ? requestedMetrics.length : 0;
  }
}