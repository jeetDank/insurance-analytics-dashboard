import { Component, Input } from '@angular/core';

interface insights {
  title: string;
  subTitle: string;
  bulletPoints: string[];
  id: number;
}



@Component({
  selector: 'app-insights',
  imports: [],
  templateUrl: './insights.component.html',
  styleUrl: './insights.component.scss',
})
export class InsightsComponent {
  @Input() data: insights[] = [
    {
      id:1,
      title: 'Insights',
      subTitle: '',
      bulletPoints: [
        'Aflac Inc demonstrates profitable underwriting with combined ratio of 93.2%',
        'Elevated catastrophe losses impacting profitability this period',
      ],
    },
    {
      id:1,
      title: 'Transcript Analysis:',
      subTitle: 'Sentiment: Positive (Confidence: 92.28%)',
      bulletPoints: [
        'Digital initiatives expected to reduce expense ratios by 2-3%',
        'Management emphasized focus on profitable growth over market share',
      ],
    },
  ];
}
