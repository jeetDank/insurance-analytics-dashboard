import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Component, OnInit } from '@angular/core';
import { MainService } from '../../common/services/main.service';

interface Formula {
  name: string;
  formula: string;
  description: string;
  id: number;
}

@Component({
  selector: 'app-saved-formulas',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    ToastModule,
  ],
  templateUrl: './saved-formulas.component.html',
  styleUrl: './saved-formulas.component.scss',
})
export class SavedFormulasComponent implements OnInit {
  searchQuery: string = '';
  formulas: Formula[] = [];
  isLoading: boolean = false;

  constructor(
    private messageService: MessageService,
    private main: MainService
  ) {}

  ngOnInit() {
    this.getAllFormulas();
  }

  get filteredFormulas(): Formula[] {
    if (!this.searchQuery.trim()) {
      return this.formulas;
    }

    const query = this.searchQuery.toLowerCase();
    return this.formulas.filter(
      (formula) =>
        formula.name.toLowerCase().includes(query) ||
        formula.formula.toLowerCase().includes(query) ||
        formula.description.toLowerCase().includes(query)
    );
  }

  copyFormula(formula: Formula): void {
    navigator.clipboard
      .writeText(formula.formula)
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Copied!',
          detail: `${formula.name} formula copied to clipboard`,
          life: 2000,
        });
      })
      .catch((err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to copy formula',
          life: 3000,
        });
        console.error('Failed to copy:', err);
      });
  }

  getAllFormulas() {
    this.isLoading = true;
    this.main.getAllFormulas().subscribe({
      next: (res: any) => {
        console.log('API Response:', res);

        if (res.success && res.formulas && res.formulas.length > 0) {
          // Map API response to Formula interface
          this.formulas = res.formulas.map((item: any, index: number) => ({
            id: index + 1,
            name: item.display_name || this.formatMetricName(item.metric_name),
            formula: this.formatFormula(item.formula),
            description: this.getFormulaDescription(item),
          }));

          console.log('Formulas loaded successfully:', this.formulas.length);
          
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: `Loaded ${this.formulas.length} formulas`,
            life: 2000,
          });
        } else {
          console.warn('No formulas found in API response');
          this.messageService.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'No formulas available',
            life: 3000,
          });
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching formulas:', err);
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load formulas from server',
          life: 3000,
        });
      },
    });
  }

  /**
   * Format metric name from snake_case to Title Case
   */
  private formatMetricName(metricName: string): string {
    return metricName
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Format formula for better readability
   */
  private formatFormula(formula: string): string {
    // Replace common operators with more readable versions
    return formula
      .replace(/\*/g, '×')
      .replace(/\//g, '÷')
      .replace(/if\s+/g, 'if ')
      .replace(/else\s+/g, 'else ')
      .trim();
  }

  /**
   * Generate a meaningful description based on formula metadata
   */
  private getFormulaDescription(item: any): string {
    const formatType = item.format_type || '';
    const metricName = item.display_name || this.formatMetricName(item.metric_name);

    // Create description based on format type and available metadata
    let description = '';

    switch (formatType) {
      case 'percentage':
        description = `${metricName} expressed as a percentage`;
        if (item.min_value !== undefined && item.max_value !== undefined) {
          description += ` (range: ${item.min_value * 100}% - ${item.max_value * 100}%)`;
        }
        break;
      case 'ratio':
        description = `Ratio metric for ${metricName}`;
        if (item.min_value !== undefined && item.max_value !== undefined) {
          description += ` (range: ${item.min_value} - ${item.max_value})`;
        }
        break;
      case 'currency':
        description = `${metricName} in currency units`;
        break;
      default:
        description = `Calculated metric for ${metricName}`;
    }

    return description;
  }
}