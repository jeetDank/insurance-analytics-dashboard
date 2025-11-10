import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExcelDataDebugService {
  
  /**
   * Validates and logs the structure of data before Excel export
   * Use this to diagnose data issues
   */
  validateExportData(data: any): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    console.group('📊 Excel Export Data Validation');

    // Check top-level structure
    if (!data) {
      errors.push('Data is null or undefined');
      console.error('❌ Data is null or undefined');
      console.groupEnd();
      return { isValid: false, errors, warnings };
    }

    console.log('✅ Data object exists');

    // Check companies array
    if (!data.companies) {
      errors.push('Missing "companies" property');
      console.error('❌ Missing "companies" property');
    } else if (!Array.isArray(data.companies)) {
      errors.push('"companies" is not an array');
      console.error('❌ "companies" is not an array, type:', typeof data.companies);
    } else {
      console.log('✅ Companies array exists with', data.companies.length, 'companies');

      // Check each company
      data.companies.forEach((company: any, index: number) => {
        console.group(`Company ${index + 1}:`);
        
        if (!company) {
          errors.push(`Company at index ${index} is null/undefined`);
          console.error('❌ Company is null/undefined');
          console.groupEnd();
          return;
        }

        // Check company properties
        console.log('- Name:', company.name || '❌ MISSING');
        console.log('- CIK:', company.cik || '❌ MISSING');
        console.log('- Latest Period:', company.latest_period || '❌ MISSING');
        console.log('- Periods:', company.periods ?? '❌ MISSING');

        if (!company.name) warnings.push(`Company at index ${index} missing name`);
        if (!company.cik) warnings.push(`Company at index ${index} missing CIK`);

        // Check metrics
        if (!company.metrics) {
          errors.push(`Company "${company.name || index}" missing "metrics" property`);
          console.error('❌ Missing "metrics" property');
        } else if (typeof company.metrics !== 'object') {
          errors.push(`Company "${company.name || index}" metrics is not an object`);
          console.error('❌ "metrics" is not an object, type:', typeof company.metrics);
        } else {
          const metricCount = Object.keys(company.metrics).length;
          console.log('✅ Metrics:', metricCount, 'metrics found');

          if (metricCount === 0) {
            warnings.push(`Company "${company.name || index}" has no metrics`);
            console.warn('⚠️  No metrics data');
          } else {
            // Sample first few metrics
            const metricKeys = Object.keys(company.metrics).slice(0, 3);
            console.log('Sample metrics:', metricKeys.join(', '));

            // Validate metric structure
            metricKeys.forEach(key => {
              const metric = company.metrics[key];
              if (!metric || typeof metric !== 'object') {
                warnings.push(`Invalid metric structure for "${key}" in company "${company.name}"`);
                console.warn(`⚠️  Metric "${key}" is not an object`);
              } else if (metric.value === undefined || metric.value === null) {
                warnings.push(`Metric "${key}" in company "${company.name}" has no value`);
                console.warn(`⚠️  Metric "${key}" has no value`);
              }
            });
          }
        }

        console.groupEnd();
      });
    }

    // Check total_companies
    if (data.total_companies !== undefined) {
      console.log('✅ Total companies:', data.total_companies);
    } else {
      warnings.push('Missing "total_companies" property');
      console.warn('⚠️  Missing "total_companies" property');
    }

    console.groupEnd();

    const isValid = errors.length === 0;

    if (!isValid) {
      console.group('❌ VALIDATION FAILED');
      errors.forEach(error => console.error('- ' + error));
      console.groupEnd();
    }

    if (warnings.length > 0) {
      console.group('⚠️  WARNINGS');
      warnings.forEach(warning => console.warn('- ' + warning));
      console.groupEnd();
    }

    if (isValid && warnings.length === 0) {
      console.log('✅ All validation checks passed!');
    }

    return { isValid, errors, warnings };
  }

  /**
   * Prints a detailed data structure report
   */
  printDataStructure(data: any, maxDepth: number = 3) {
    console.group('📋 Data Structure Report');
    this.printObject(data, 0, maxDepth);
    console.groupEnd();
  }

  private printObject(obj: any, depth: number, maxDepth: number) {
    if (depth >= maxDepth) {
      console.log('... (max depth reached)');
      return;
    }

    if (obj === null || obj === undefined) {
      console.log(`${obj}`);
      return;
    }

    if (typeof obj !== 'object') {
      console.log(`${obj} (${typeof obj})`);
      return;
    }

    if (Array.isArray(obj)) {
      console.log(`Array(${obj.length})`);
      if (obj.length > 0) {
        console.group('First item:');
        this.printObject(obj[0], depth + 1, maxDepth);
        console.groupEnd();
      }
      return;
    }

    Object.keys(obj).forEach(key => {
      if (Array.isArray(obj[key])) {
        console.log(`${key}: Array(${obj[key].length})`);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        console.group(`${key}:`);
        this.printObject(obj[key], depth + 1, maxDepth);
        console.groupEnd();
      } else {
        console.log(`${key}: ${obj[key]} (${typeof obj[key]})`);
      }
    });
  }

  /**
   * Safely transforms API data to Excel export format
   */
  safeTransformData(apiResponse: any): any {
    if (!apiResponse?.analysisData?.results) {
      console.error('Invalid API response structure');
      return null;
    }

    const companies = Array.isArray(apiResponse.analysisData.results) 
      ? apiResponse.analysisData.results 
      : [];

    // Transform and validate each company
    const transformedCompanies = companies.map((company: any, index: number) => {
      if (!company || typeof company !== 'object') {
        console.warn(`Skipping invalid company at index ${index}`);
        return null;
      }

      return {
        name: company.name || `Company ${index + 1}`,
        cik: company.cik || 'Unknown',
        periods: company.periods || 0,
        latest_period: company.latest_period || 'N/A',
        metrics: company.metrics && typeof company.metrics === 'object' ? company.metrics : {}
      };
    }).filter((c:any) => c !== null); // Remove nulls

    return {
      total_companies: transformedCompanies.length,
      companies: transformedCompanies
    };
  }
}