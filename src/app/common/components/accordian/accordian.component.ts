import { Component, Input } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { TagModule } from 'primeng/tag';
import { InsightsComponent } from '../insights/insights.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomMessageComponent } from '../custom-message/custom-message.component';

interface tabData {
  title: string;
  value: number;
  subTitle: string;
  icon: string;
  steps: steps[];
}

interface steps {
  title: string;
  subTitle: string | null;
  tag: string | null;
  list: subList[] | null;
  id: number;
  icon: string | null;
  tagIcon: string | null;
  message: messageDetails | null
}

interface subList {
  listTitle: string | null;
  listIcon: string | null;
  list: listItem[] | null;
}
interface listItem {
  itemTitle: string | null;
  itemIcon: string | null;
}

interface messageDetails{
  severity:string |null;
  icon:string | null;
  title:string | null;
  message:string

}

@Component({
  selector: 'app-accordian',
  imports: [AccordionModule, TagModule,SelectButtonModule,FormsModule,CustomMessageComponent],
  templateUrl: './accordian.component.html',
  styleUrl: './accordian.component.scss',
})
export class AccordianComponent {
  @Input() title: string = 'Chain of Thought Log';



  @Input() tabs: tabData[] = [
    {
      title: 'Step 1: Data Collection',
      icon: 'pi pi-check-circle',
      subTitle: 'Processing Steps: 4 unique to this system',
      value: 0,
      steps: [
        {
          title: 'Parsing user query',
          subTitle:
            'Identified companies: Apple, Microsoft | Analysis: Geographic revenue breakdown',
          tag: 'unique',
          tagIcon: 'pi pi-sparkles',
          list: null,
          id: 1,
          icon: 'pi pi-verified',
          message:{
            severity:'warn',
            icon:"pi pi-exclamation-circle",
            title:"chatgpt discrepancy:",
            message:"Cannot access real-time SEC filings. Would either: (1) Use training data from months/years ago, leading to outdated/incorrect revenue figures (e.g., might report Q2 2024 data when you asked for Q4 2024), or (2) Require you to manually find, download, copy-paste or upload the SEC filings. Results would lack filing dates and CIK verification."
          }
        },
        {
          title: 'Direct SEC segment data extraction',
          subTitle:
            'Automatically parsed segment disclosure notes, extracted geographic revenue tables from XBRL taxonomies',
          tag: 'unique',
          tagIcon: 'pi pi-sparkles',
          list: [
            {
              listTitle: 'Direct data sources (no manual input required):',
              listIcon: 'pi pi-database',
              list: [
                {
                  itemTitle: 'Apple Inc. 10-Q Q4 2024 - Note 11: Segment Information and Geographic Data',
                  itemIcon: 'pi pi-file',
                },
                {
                  itemTitle: 'Microsoft Corp. 10-Q Q4 2024 - Note 17: Segment Information',
                  itemIcon: 'pi pi-file',
                },
              ],
            },
          ],
          id: 2,
          icon: 'pi pi-verified',
          message:{
            severity:'warn',
            icon:"pi pi-exclamation-circle",
            title:"chatgpt discrepancy:",
            message:"Cannot access real-time SEC filings. Would either: (1) Use training data from months/years ago, leading to outdated/incorrect revenue figures (e.g., might report Q2 2024 data when you asked for Q4 2024), or (2) Require you to manually find, download, copy-paste or upload the SEC filings. Results would lack filing dates and CIK verification."
          }
        },
        {
          title: 'Cross-company normalization',
          subTitle:
            `Normalized different geographic categorizations (Apple uses 'Greater China' vs Microsoft uses 'Asia Pacific'), aligned reporting periods, converted to comparable format`,
          tag: 'unique',
          tagIcon: 'pi pi-sparkles',
          list: null,
          id: 1,
          icon: 'pi pi-verified',
          message:{
            severity:'warn',
            icon:"pi pi-exclamation-circle",
            title:"Chatgpt Discrepancy:",
            message:"Cannot access real-time SEC filings. Would either: (1) Use training data from months/years ago, leading to outdated/incorrect revenue figures (e.g., might report Q2 2024 data when you asked for Q4 2024), or (2) Require you to manually find, download, copy-paste or upload the SEC filings. Results would lack filing dates and CIK verification."
          }
        },
        {
          title: 'Visualization-ready data preparation',
          subTitle:
            `Structured data for comparative charts, calculated regional percentages, validated totals reconcile to consolidated revenue`,
          tag: 'unique',
          tagIcon: 'pi pi-sparkles',
          list: null,
          id: 3,
          icon: 'pi pi-verified',
          message:{
            severity:'warn',
            icon:"pi pi-exclamation-circle",
            title:"chatgpt discrepancy:",
            message:"Cannot access real-time SEC filings. Would either: (1) Use training data from months/years ago, leading to outdated/incorrect revenue figures (e.g., might report Q2 2024 data when you asked for Q4 2024), or (2) Require you to manually find, download, copy-paste or upload the SEC filings. Results would lack filing dates and CIK verification."
          }
        },
      ],
    },
  ];

  selectedComparisonValue:any="0"


  comparisonType = [
    {
      label:"No Comparison",
      value:"0",

    },
    {
      label:"Claude",
      value:"1",

    },
    {
      label:"ChatGPT",
      value:"2",

    },
    {
      label:"Gemini",
      value:"3",

    },
  ]

  customMessage = [
    "Data accuracy: Likely outdated or hallucinated numbers - can't verify against current SEC filings",
    "Manual work: Requires hours of manual data extraction, transcription, and Excel calculations",
    "Error risk: High probability of calculation errors, missing footnotes, or wrong line items",
    "Compliance: No audit trail or source verification - fails professional standards for financial analysis",
    "Comparability: Cannot normalize across different company reporting structures or fiscal calendars"
  ]
}
