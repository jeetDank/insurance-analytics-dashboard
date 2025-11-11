import { Component, input, effect, signal } from '@angular/core';
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
  nodeType?:any
}

// Interface for segment groups (like "Business Segments", "Consolidation Items")
export interface SegmentGroup {
  [key: string]: MetricNode;
}

// Interface for quarter data
export interface QuarterData {
  period?: string;
  quarter?: string;
  year?: number;
  metrics: { [key: string]: MetricNode };
}

// Interface for company data
export interface CompanyData {
  company_name: string;
  ticker?: string;
  statements: QuarterData[];
}

// Internal tree node structure
interface TreeNode {
  name: string;
  value?: number;
  percentage_of_parent?: number;
  format_type?: string;
  unit?: string;
  description?: string | null;
  nodeType: 'company' | 'quarter' | 'metric' | 'segment-group' | 'segment';
  isSegmentGroup?: boolean;
  children?: TreeNode[];
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
  treeFlattener: MatTreeFlattener<TreeNode, FlatMetricNode>;
  dataSource: MatTreeFlatDataSource<TreeNode, FlatMetricNode>;

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
  private transformer = (node: TreeNode, level: number): FlatMetricNode => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      value: node.value,
      percentage_of_parent: node.percentage_of_parent,
      format_type: node.format_type,
      level: level,
      unit: node.unit,
      description: node.description,
      nodeType: node.nodeType,
      isSegmentGroup: node.isSegmentGroup || false
    };
  };

  // Get the level of the node
  private getLevel = (node: FlatMetricNode): number => node.level;

  // Check if node is expandable
  private isExpandable = (node: FlatMetricNode): boolean => node.expandable;

  // Get children of the node
  private getChildren = (node: TreeNode): TreeNode[] => {
    return node.children || [];
  };

  // Check if node has children
  hasChild = (_: number, node: FlatMetricNode): boolean => node.expandable;

  // Get quarter display name
  private getQuarterDisplayName(statement: QuarterData): string {
    if (statement.period) {
      return statement.period;
    }
    if (statement.quarter && statement.year) {
      return `${statement.quarter} ${statement.year}`;
    }
    return 'Period';
  }

  // Helper method to check if an object is a segment group
  private isSegmentGroup(obj: any): boolean {
    if (!obj || typeof obj !== 'object') return false;
    
    const keys = Object.keys(obj);
    if (keys.length === 0) return false;
    
    if ('value' in obj) return false;
    
    return keys.every(key => {
      const child = obj[key];
      return child && typeof child === 'object' && 'value' in child;
    });
  }

  // Convert metric node to tree node
  private convertMetricToTreeNode(metric: MetricNode): TreeNode {
    const treeNode: TreeNode = {
      name: metric.name,
      value: metric.value,
      percentage_of_parent: metric.percentage_of_parent,
      format_type: metric.format_type,
      unit: metric.unit,
      description: metric.description,
      nodeType: 'metric',
      isSegmentGroup: false,
      children: []
    };

    // Process children if they exist
    if (metric.children && Object.keys(metric.children).length > 0) {
      Object.keys(metric.children).forEach(key => {
        const child:any = metric.children![key];
        
        if (this.isSegmentGroup(child)) {
          // This is a segment group
          const segmentGroupNode: TreeNode = {
            name: key,
            nodeType: 'segment-group',
            isSegmentGroup: true,
            children: []
          };
          
          // Add segments to the group
          Object.keys(child).forEach(segmentKey => {
            const segment = child[segmentKey] as MetricNode;
            segmentGroupNode.children!.push(this.convertMetricToTreeNode({
              ...segment,
              nodeType: 'segment' as any
            }));
          });
          
          treeNode.children!.push(segmentGroupNode);
        } else {
          // This is a regular child metric
          const childMetric = child as MetricNode;
          treeNode.children!.push(this.convertMetricToTreeNode({
            ...childMetric,
            nodeType: 'segment' as any
          }));
        }
      });
    }

    return treeNode;
  }

  // Helper method to check if a metric should be included
  private shouldIncludeMetric(metricKey: string, requestedMetrics: string[]): boolean {
    if (!requestedMetrics || requestedMetrics.length === 0) {
      return true;
    }
    
    return requestedMetrics.some(requestedMetric => {
      const normalizedMetricKey = metricKey.toLowerCase();
      const normalizedRequestedMetric = requestedMetric.toLowerCase();
      
      if (normalizedMetricKey === normalizedRequestedMetric) {
        return true;
      }
      
      if (normalizedMetricKey.startsWith(normalizedRequestedMetric + '_')) {
        return true;
      }
      
      return false;
    });
  }

  // Load data from input companies
  private loadData(companies: CompanyData[], requestedMetrics: string[]): void {
    const treeData: TreeNode[] = [];

    companies.forEach(company => {
      const companyNode: TreeNode = {
        name: company.company_name + (company.ticker ? ` (${company.ticker})` : ''),
        nodeType: 'company',
        children: []
      };

      company.statements.forEach(statement => {
        const quarterNode: TreeNode = {
          name: this.getQuarterDisplayName(statement),
          nodeType: 'quarter',
          children: []
        };

        // Process metrics for this quarter
        Object.keys(statement.metrics).forEach(metricKey => {
          // Apply filter
          if (this.shouldIncludeMetric(metricKey, requestedMetrics)) {
            const metric = statement.metrics[metricKey];
            const metricTreeNode = this.convertMetricToTreeNode(metric);
            quarterNode.children!.push(metricTreeNode);
          }
        });

        // Only add quarter if it has metrics
        if (quarterNode.children!.length > 0) {
          companyNode.children!.push(quarterNode);
        }
      });

      // Only add company if it has quarters with metrics
      if (companyNode.children!.length > 0) {
        treeData.push(companyNode);
      }
    });

    this.dataSource.data = treeData;
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
  
  // Get count of displayed metrics
  getDisplayedMetricsCount(): number {
    const requestedMetrics = this.requestedMetrics();
    return requestedMetrics && requestedMetrics.length > 0 ? requestedMetrics.length : 0;
  }
}