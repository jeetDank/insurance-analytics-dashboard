import { Component, Input } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { InsightsComponent } from '../insights/insights.component';

interface tabData {
  title: string;
  value: number;
  subTitle: string;
  confidence: string;
  content: insights[];
}

interface insights {
  title: string;
  subTitle: string;
  bulletPoints: string[];
  id: number;
}

@Component({
  selector: 'app-accordian',
  imports: [AccordionModule,InsightsComponent],
  templateUrl: './accordian.component.html',
  styleUrl: './accordian.component.scss',
})
export class AccordianComponent {
  @Input() title: string = 'Chain of Thought Log';

  @Input() tabs: tabData[] = [
    {
      title: 'Step 1: Data Collection',
      subTitle:
        'Retrieved financial metrics from company filings and databases',
      confidence: '95%',
      value: 0,
      content: [
        {
          title: 'Evidence Sources:',
          subTitle: '',
          bulletPoints: ['SEC 10-K filing', 'Company earnings release'],
          id: 0,
        },
        {
          title: 'Intermediate Values:',
          subTitle: '',
          bulletPoints: ['data_completeness: 98%', 'filing_date: 2024-02-15'],
          id: 1,
        },
      ],
    },
    {
      title: 'Step 2: Metric Calculation',
      subTitle: 'Calculated key insurance ratios and performance indicators',
      confidence: '92.00%',
      value: 1,
      content: [
        {
          title: 'Evidence Sources:',
          subTitle: '',
          bulletPoints: ['GAAP accounting standards', 'Industry benchmarks'],
          id: 0,
        },
        {
          title: 'Intermediate Values:',
          subTitle: '',
          bulletPoints: ['combined_ratio: 96.5%', 'loss_ratio: 67.2%'],
          id: 1,
        },
      ],
    },
    {
      title: 'Step 3: Trend Analysis',
      subTitle: 'Analyzed historical trends and peer comparisons',
      confidence: '88.00%',
      value: 2,
      content: [
        {
          title: 'Evidence Sources:',
          subTitle: '',
          bulletPoints: ['5-year historical data', 'Industry peer group'],
          id: 0,
        },
        {
          title: 'Intermediate Values:',
          subTitle: '',
          bulletPoints: ['trend_direction: improving', 'peer_percentile: 75th'],
          id: 1,
        },
      ],
    },
  ];
}
