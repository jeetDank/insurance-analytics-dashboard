import { Component } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { IconsModule } from '../../common/components/icon/icons.module';
import { TableComponent } from '../../common/components/table/table.component';
import { CardSkeletonComponent } from '../../common/components/card-skeleton/card-skeleton.component';
import { CommonModule } from '@angular/common';
import { InsightsComponent } from '../../common/components/insights/insights.component';
import { AccordianComponent } from '../../common/components/accordian/accordian.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { EChartsOption } from 'echarts';
import { EchartsComponent } from '../../common/components/echart/echart.component';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-interactive-ai-chats',
  imports: [
    EchartsComponent,
    CommonModule,
    MultiSelectModule,
    AccordianComponent,
    InsightsComponent,
    SelectModule,
    ButtonModule,
    MessageModule,
    IconsModule,
    TableComponent,
    CardSkeletonComponent,
    CommonModule,
    TextareaModule,
  ],
  templateUrl: './interactive-ai-chats.component.html',
  styleUrl: './interactive-ai-chats.component.scss',
})
export class InteractiveAiChatsComponent {
  skeletonVisible: boolean = true;

  companies = ['company a', 'company b', 'company c'];
  selectedCompanies = 'company a';

  treemapData = [
    {
      name: 'Company A',
      value: 1200, // Revenue in millions
      combinedRatio: 92,
      children: [
        { name: 'Revenue', value: 1200 },
        { name: 'Combined Ratio', value: 92 },
      ],
    },
    {
      name: 'Company B',
      value: 900,
      combinedRatio: 97,
      children: [
        { name: 'Revenue', value: 900 },
        { name: 'Combined Ratio', value: 97 },
      ],
    },
    {
      name: 'Company C',
      value: 700,
      combinedRatio: 101,
      children: [
        { name: 'Revenue', value: 700 },
        { name: 'Combined Ratio', value: 101 },
      ],
    },
    {
      name: 'Company D',
      value: 1500,
      combinedRatio: 89,
      children: [
        { name: 'Revenue', value: 1500 },
        { name: 'Combined Ratio', value: 89 },
      ],
    },
  ];
  treemapOption: EChartsOption = {
    title: {
      text: 'Insurance Companies - Revenue & Combined Ratio',
      left: 'center',
    },
    tooltip: {
      formatter: (info: any) => {
        const { name, value, data } = info;
        if (data.combinedRatio) {
          return `
          <strong>${name}</strong><br/>
          Revenue: $${data.value}M<br/>
          Combined Ratio: ${data.combinedRatio}%
        `;
        } else {
          return `<strong>${name}</strong>: ${value}`;
        }
      },
    },
    series: [
      {
        type: 'treemap',
        roam: false,
        nodeClick: false,
        label: {
          show: true,
          formatter: '{b}',
        },
        upperLabel: {
          show: true,
          height: 30,
        },
        breadcrumb: { show: false },
        data: this.treemapData,
      },
    ],
  };

  constructor() {
    setTimeout(() => {
      this.skeletonVisible = false;
    }, 5000);
  }

  chartOptions: EChartsOption = {
    title: {
      text: 'Basic Radar Chart',
    },
    legend: {
      data: ['Allocated Budget', 'Actual Spending'],
    },
    radar: {
      // shape: 'circle',
      indicator: [
        { name: 'Sales', max: 6500 },
        { name: 'Administration', max: 16000 },
        { name: 'Information Technology', max: 30000 },
        { name: 'Customer Support', max: 38000 },
        { name: 'Development', max: 52000 },
        { name: 'Marketing', max: 25000 },
      ],
    },
    series: [
      {
        name: 'Budget vs spending',
        type: 'radar',
        data: [
          {
            value: [4200, 3000, 20000, 35000, 50000, 18000],
            name: 'Allocated Budget',
          },
          {
            value: [5000, 14000, 28000, 26000, 42000, 21000],
            name: 'Actual Spending',
          },
        ],
      },
    ],
  };

  onChartInit(chart: any) {
    console.log('Chart initialized:', chart);
  }

  update() {
    this.chartOptions = {
      ...this.chartOptions,
      series: [
        {
          type: 'bar',
          data: Array.from({ length: 4 }, () => Math.random() * 50),
        },
      ],
    };
  }
}
