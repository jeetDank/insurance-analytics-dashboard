import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Component } from '@angular/core';

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
    ToastModule
  ],
  templateUrl: './saved-formulas.component.html',
  styleUrl: './saved-formulas.component.scss'
})
export class SavedFormulasComponent {

  searchQuery: string = '';

  constructor(private messageService: MessageService) {}

  formulas: Formula[] = [
    {
      name: 'Loss Ratio',
      formula: '(Incurred Losses + Loss Adjustment Expenses) / Earned Premiums × 100',
      description: 'Measures the ratio of losses and expenses to earned premiums',
      id: 1
    },
    {
      name: 'Combined Ratio',
      formula: 'Loss Ratio + Expense Ratio',
      description: 'Key profitability metric; below 100% indicates underwriting profit',
      id: 2
    },
    {
      name: 'Expense Ratio',
      formula: '(Underwriting Expenses / Written Premiums) × 100',
      description: 'Percentage of premium used for operating expenses',
      id: 3
    },
    {
      name: 'Premium to Surplus Ratio',
      formula: 'Net Written Premium / Policyholder Surplus',
      description: 'Measures financial leverage and capacity to write new business',
      id: 4
    },
    {
      name: 'Claims Frequency',
      formula: 'Number of Claims / Number of Policies (or Exposure Units)',
      description: 'Measures how often claims occur relative to exposure',
      id: 5
    },
    {
      name: 'Claims Severity',
      formula: 'Total Claims Cost / Number of Claims',
      description: 'Average cost per claim',
      id: 6
    },
    {
      name: 'Retention Ratio',
      formula: '(Policies Renewed / Total Policies Up for Renewal) × 100',
      description: 'Percentage of policies that are renewed',
      id: 7
    },
    {
      name: 'Customer Lifetime Value (CLV)',
      formula: '(Average Premium × Retention Rate) / (1 + Discount Rate - Retention Rate)',
      description: 'Projected revenue from a customer over their lifetime',
      id: 8
    },
    {
      name: 'Return on Equity (ROE)',
      formula: '(Net Income / Average Shareholders Equity) × 100',
      description: 'Measures profitability relative to shareholder equity',
      id: 9
    },
    {
      name: 'Reserve to Premium Ratio',
      formula: 'Total Reserves / Net Written Premium',
      description: 'Indicates reserve adequacy relative to premium volume',
      id: 10
    },
    {
      name: 'Quick Ratio',
      formula: '(Current Assets - Inventory) / Current Liabilities',
      description: 'Measures ability to meet short-term obligations',
      id: 11
    },
    {
      name: 'Policy Acquisition Cost',
      formula: 'Total Marketing & Sales Expenses / Number of New Policies',
      description: 'Average cost to acquire a new policy',
      id: 12
    },
    {
      name: 'Pure Premium',
      formula: 'Expected Losses / Exposure Units',
      description: 'Expected loss cost per unit of exposure',
      id: 13
    },
    {
      name: 'Underwriting Profit Margin',
      formula: '((Earned Premium - Incurred Losses - Expenses) / Earned Premium) × 100',
      description: 'Profit from underwriting operations as percentage of premium',
      id: 14
    },
    {
      name: 'Investment Yield',
      formula: '(Investment Income / Average Invested Assets) × 100',
      description: 'Return generated from investment portfolio',
      id: 15
    }
  ];

  get filteredFormulas(): Formula[] {
    if (!this.searchQuery.trim()) {
      return this.formulas;
    }

    const query = this.searchQuery.toLowerCase();
    return this.formulas.filter(formula =>
      formula.name.toLowerCase().includes(query) ||
      formula.formula.toLowerCase().includes(query) ||
      formula.description.toLowerCase().includes(query)
    );
  }

  copyFormula(formula: Formula): void {
    navigator.clipboard.writeText(formula.formula).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copied!',
        detail: `${formula.name} formula copied to clipboard`,
        life: 2000
      });
    }).catch(err => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to copy formula',
        life: 3000
      });
      console.error('Failed to copy:', err);
    });
  }

}
