import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
interface Dashboard {
  name: string;
  id: number;
}
@Component({
  selector: 'app-past-dashboards',
  imports: [CommonModule,
    FormsModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule],
  templateUrl: './past-dashboards.component.html',
  styleUrl: './past-dashboards.component.scss'
})
export class PastDashboardsComponent {

  searchQuery: string = '';
  selectedDashboard: Dashboard | null = null;

  pastDashboards: Dashboard[] = [
    {
      name: "State Farm vs Allstate: Q4 2024 Claims Analysis by Region",
      id: 1
    },
    {
      name: "Progressive Auto Insurance: Policy Renewal Trends and Lapse Rates",
      id: 2
    },
    {
      name: "Geico vs Liberty Mutual: Premium Revenue Breakdown Comparison",
      id: 3
    },
    {
      name: "Travelers Insurance: Loss Ratio Analysis Auto vs Property",
      id: 4
    },
    {
      name: "MetLife Customer Acquisition Cost and Lifetime Value Analysis",
      id: 5
    },
    {
      name: "AIG Underwriting Performance: Risk Assessment Accuracy 2024",
      id: 6
    },
    {
      name: "USAA Claims Processing Time vs Industry Benchmarks",
      id: 7
    },
    {
      name: "Nationwide Insurance: Fraud Detection Patterns Q1-Q3 2024",
      id: 8
    },
    {
      name: "Farmers Insurance Agent Performance and Commission Analysis",
      id: 9
    },
    {
      name: "Chubb vs Zurich: Catastrophic Event Impact on Claims",
      id: 10
    },
    {
      name: "State Farm Market Share vs Progressive, Geico, and Allstate",
      id: 11
    },
    {
      name: "Munich Re vs Swiss Re: Reinsurance Coverage Optimization",
      id: 12
    },
    {
      name: "Prudential Customer Churn Prediction and Retention Strategies",
      id: 13
    },
    {
      name: "Hartford Insurance: Combined Ratio Trends Across Segments",
      id: 14
    },
    {
      name: "Aflac Regulatory Compliance Metrics and Reserve Adequacy 2024",
      id: 15
    }
  ];

  get filteredDashboards(): Dashboard[] {
    if (!this.searchQuery.trim()) {
      return this.pastDashboards;
    }

    const query = this.searchQuery.toLowerCase();
    return this.pastDashboards.filter(dashboard =>
      dashboard.name.toLowerCase().includes(query)
    );
  }

  selectDashboard(dashboard: Dashboard): void {
    this.selectedDashboard = dashboard;
    console.log('Selected dashboard:', dashboard);
    // Add your navigation or data loading logic here
  }

}
