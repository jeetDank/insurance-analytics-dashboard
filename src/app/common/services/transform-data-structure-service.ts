import { Injectable } from "@angular/core";

// Interfaces for better type safety
export interface MetricDetail {
  name: string;
  value: number;
  concept: string;
  unit: string;
  decimals: number;
  context_ref: string | null;
  is_calculated: boolean;
  variable_name: string;
  description: string;
  format_type: string;
  parent_value: number;
  percentage_of_parent: number;
  children?: Record<string, MetricDetail>;
}

export interface TransformedMetric {
  [segmentName: string]: MetricDetail;
}

export interface Quarter {
  metrics?: any;
  [key: string]: any;
}

export interface TransformedQuarter {
  metrics: Record<string, TransformedMetric>;
  [key: string]: any;
}

export interface Company {
  statements?: Quarter[];
  [key: string]: any;
}

export interface TransformedCompany {
  quarters: TransformedQuarter[];
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class TransformDataStructureService {

  /**
   * Transform company data structure
   * @param companies Array of company objects
   * @returns Transformed company data with nested quarters and metrics
   */
  transformCompanyData(companies: Company[]): TransformedCompany[] {
    if (!Array.isArray(companies)) {
      console.warn('TransformDataStructure: companies is not an array');
      return [];
    }

    return companies.map((company: Company) => {
      return {
        ...company,
        quarters: this.transformQuarters(company.statements || [])
      };
    });
  }

  /**
   * Transform quarters/statements array
   * @param statements Array of quarter/statement objects
   * @returns Transformed quarters with metrics as objects
   */
  private transformQuarters(statements: Quarter[]): TransformedQuarter[] {
    if (!Array.isArray(statements)) {
      console.warn('TransformDataStructure: statements is not an array');
      return [];
    }

    return statements.map((quarter: Quarter) => {
      return {
        ...quarter,
        metrics: this.extractMetrics(quarter.metrics || {}, 0, 10)
      };
    });
  }

  /**
   * Recursively extract metrics and their children up to specified depth
   * @param metricsObject Object containing metrics
   * @param currentDepth Current recursion depth
   * @param maxDepth Maximum recursion depth (default 10)
   * @returns Object with metric names as keys
   */
  private extractMetrics(
    metricsObject: any,
    currentDepth: number,
    maxDepth: number
  ): Record<string, TransformedMetric> {
    if (!metricsObject || typeof metricsObject !== 'object' || currentDepth >= maxDepth) {
      return {};
    }

    const metricsResult: Record<string, TransformedMetric> = {};

    for (const [metricKey, metricData] of Object.entries(metricsObject)) {
      // Skip the 'children' key itself when iterating
      if (metricKey === 'children') {
        continue;
      }

      // If metricData is an object with segments/breakdowns
      if (metricData && typeof metricData === 'object' && !Array.isArray(metricData)) {
        const metricSegments: TransformedMetric = {};

        // Iterate through each segment/breakdown
        for (const [segmentKey, segmentData] of Object.entries(metricData)) {
          if (segmentKey === 'children') {
            continue;
          }

          // Handle segment data
          if (segmentData && typeof segmentData === 'object') {
            const segmentDetail: any = { ...segmentData };

            // Check if this segment has children and recursively process them
            if ('children' in segmentData && segmentData.children && typeof segmentData.children === 'object') {
              // Remove children from spread to handle separately
              delete segmentDetail.children;
              
              // Recursively extract children
              const childrenMetrics = this.extractMetrics(
                segmentData.children,
                currentDepth + 1,
                maxDepth
              );

              // Only add children if there are any
              if (Object.keys(childrenMetrics).length > 0) {
                segmentDetail.children = childrenMetrics;
              }
            }

            metricSegments[segmentKey] = segmentDetail;
          } else {
            // If segment data is a primitive, store it directly
            metricSegments[segmentKey] = segmentData as any;
          }
        }

        // Only add metric if it has segments
        if (Object.keys(metricSegments).length > 0) {
          metricsResult[metricKey] = metricSegments;
        }
      } else if (Array.isArray(metricData)) {
        // Handle array of metric segments (like your example structure)
        const consolidatedMetric: TransformedMetric = {};

        for (const item of metricData) {
          if (item && typeof item === 'object') {
            const metricName = item.metric_name;
            
            if (metricName) {
              // Remove metric_name from the item to avoid duplication
              const { metric_name, children, ...segments } = item;

              // Add all segments for this metric
              for (const [segmentKey, segmentValue] of Object.entries(segments)) {
                if (segmentValue && typeof segmentValue === 'object') {
                  const segmentDetail: any = { ...segmentValue };

                  // Check if segment has children
                  if ('children' in segmentValue && segmentValue.children) {
                    delete segmentDetail.children;
                    
                    const childrenMetrics = this.extractMetrics(
                      { children: segmentValue.children },
                      currentDepth + 1,
                      maxDepth
                    );

                    if (Object.keys(childrenMetrics).length > 0) {
                      segmentDetail.children = childrenMetrics;
                    }
                  }

                  consolidatedMetric[segmentKey] = segmentDetail;
                }
              }
            }

            // Handle children at item level
            if (item.children && typeof item.children === 'object') {
              const childrenMetrics = this.extractMetrics(
                item.children,
                currentDepth + 1,
                maxDepth
              );

              // Merge children into consolidated metric
              Object.assign(consolidatedMetric, childrenMetrics);
            }
          }
        }

        if (Object.keys(consolidatedMetric).length > 0) {
          metricsResult[metricKey] = consolidatedMetric;
        }
      } else {
        // Handle primitive values
        metricsResult[metricKey] = metricData as any;
      }
    }

    return metricsResult;
  }

  /**
   * Find a specific metric segment by path
   * @param metrics Metrics object
   * @param path Array of keys representing the path (e.g., ['revenue', 'Operatings'])
   * @returns Found metric detail or null
   */
  findMetricByPath(metrics: Record<string, any>, path: string[]): any {
    let current = metrics;

    for (const key of path) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return null;
      }
    }

    return current;
  }

  /**
   * Get all segment names for a specific metric
   * @param metrics Metrics object
   * @param metricName Name of the metric
   * @returns Array of segment names
   */
  getSegmentNames(metrics: Record<string, TransformedMetric>, metricName: string): string[] {
    if (metricName in metrics) {
      return Object.keys(metrics[metricName]);
    }
    return [];
  }

  /**
   * Flatten all metrics into a single-level object with dot notation keys
   * @param metrics Metrics object
   * @param prefix Current prefix for keys
   * @returns Flattened object
   */
  flattenMetrics(metrics: Record<string, any>, prefix: string = ''): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(metrics)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if ('children' in value) {
          // Store the value without children
          const { children, ...valueWithoutChildren } = value;
          result[newKey] = valueWithoutChildren;

          // Recursively flatten children
          if (children) {
            const flattenedChildren = this.flattenMetrics(children, newKey);
            Object.assign(result, flattenedChildren);
          }
        } else {
          // Recursively flatten nested objects
          const flattened = this.flattenMetrics(value, newKey);
          Object.assign(result, flattened);
        }
      } else {
        result[newKey] = value;
      }
    }

    return result;
  }

  /**
   * Get all metrics at a specific depth level
   * @param metrics Metrics object
   * @param targetDepth Target depth (0 = top level)
   * @param currentDepth Current depth (used internally)
   * @returns Object with metrics at specified depth
   */
  getMetricsAtDepth(
    metrics: Record<string, any>,
    targetDepth: number,
    currentDepth: number = 0
  ): Record<string, any> {
    if (currentDepth === targetDepth) {
      return metrics;
    }

    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(metrics)) {
      if (value && typeof value === 'object') {
        if ('children' in value && value.children) {
          const childMetrics = this.getMetricsAtDepth(
            value.children,
            targetDepth,
            currentDepth + 1
          );
          Object.assign(result, childMetrics);
        } else {
          const nestedMetrics = this.getMetricsAtDepth(
            value,
            targetDepth,
            currentDepth + 1
          );
          Object.assign(result, nestedMetrics);
        }
      }
    }

    return result;
  }
}