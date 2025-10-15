import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { PopoverModule } from 'primeng/popover';
import { TagModule } from 'primeng/tag';

interface cardData {
  companyName: string;
  metricName: string;
  subTitle: string | null;
  metric: string | null;
  metricPeriod: string | null;
  trend: string | null;
  trendIcon: string | null;
  trendPositive: boolean;
}

@Component({
  selector: 'app-common-card',
  imports: [CardModule, CommonModule, PopoverModule, TagModule],
  templateUrl: './common-card.component.html',
  styleUrl: './common-card.component.scss',
})
export class CommonCardComponent {
  isEditViewOn: boolean = false;

  @Input() cardData: cardData = {
    companyName: 'Apple Inc.',
    metricName: 'Revenue',
    subTitle: null,
    metric: '104.9B',
    metricPeriod: 'Q4 2024',
    trend: '+6.1% vs Q3 2024',
    trendIcon: 'pi pi-arrow-up-right',
    trendPositive: true,
  };

  toggleEditView() {
    this.isEditViewOn = !this.isEditViewOn;
  }
}
