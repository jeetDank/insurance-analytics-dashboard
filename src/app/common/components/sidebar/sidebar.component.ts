import { Component, EventEmitter, Output } from '@angular/core';
import { PageTitleComponent } from '../page-title/page-title.component';
import { IconsModule } from '../icon/icons.module';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar',
  imports: [
    ReactiveFormsModule,
    PageTitleComponent,
    IconsModule,
    SelectModule,
    ButtonModule,
    DividerModule,
    AvatarModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Output() sidebarData = new EventEmitter<any>();

  showFiller: any = false;
  sidebarFormFieldContainer: FormGroup;
  providersList = [
    {
      value: 'openai',
      viewValue: 'OpenAI',
    },
    {
      value: 'grok',
      viewValue: 'Grok',
    },
    {
      value: 'gemini',
      viewValue: 'Gemini',
    },
    {
      value: 'claude',
      viewValue: 'Claude',
    },
    {
      value: 'mistral',
      viewValue: 'Mistral',
    },
    {
      value: 'perplexity',
      viewValue: 'Perplexity',
    },
    {
      value: 'cohere',
      viewValue: 'Cohere',
    },
    {
      value: 'deepseek',
      viewValue: 'Deepseek',
    },
    {
      value: 'fingpt',
      viewValue: 'FinGPT',
    },
    {
      value: 'huggingface',
      viewValue: 'Hugging Face',
    },
    {
      value: 'bedrock',
      viewValue: 'AWS Bedrock',
    },
    {
      value: 'azure_openai',
      viewValue: 'Azure OpenAI',
    },
    {
      value: 'togetherai',
      viewValue: 'Together AI',
    },
  ];

  llmTierList = [
    {
      value: 'Free Tier',
      viewValue: 'Free Tier',
    },
    {
      value: 'Cloud Trial Tier',
      viewValue: 'Cloud Trial Tier',
    },
    {
      value: 'Local Tier',
      viewValue: 'Local Tier',
    },
  ];

  modelList:any = [];
  modelsMap: { [key: string]: { value: string; viewValue: string }[] } = {
    openai: [],
    grok: [
      { value: 'grok-beta', viewValue: 'grok-beta' },
      { value: 'grok-vision-beta', viewValue: 'grok-vision-beta' },
    ],
    gemini: [],
    claude: [],
    mistral: [],
    perplexity: [
      { value: 'pplx-70b-online', viewValue: 'pplx-70b-online' },
      { value: 'pplx-7b-chat', viewValue: 'pplx-7b-chat' },
      { value: 'sonar-small', viewValue: 'sonar-small' },
      { value: 'sonar-medium', viewValue: 'sonar-medium' },
      { value: 'sonar-large', viewValue: 'sonar-large' },
    ],
    cohere: [],
    deepseek: [],
    fingpt: [],
    huggingface: [],
    bedrock: [],
    azure_openai: [],
    togetherai: [],
  };

  updateModelList(){
     const model = this.sidebarFormFieldContainer.get("cloud_trial_provider")?.value;
     this.modelList = this.modelsMap[model.value];
     console.log(this.modelList,model);
     
  }




  constructor(private fb: FormBuilder) {
    this.sidebarFormFieldContainer = this.fb.group({
      llm_tier: [],
      cloud_trial_provider: [],
      model: [],
      query: [],
    });
  }

  updateData() {
    this.sidebarData.emit(this.sidebarFormFieldContainer.getRawValue());
  }
}
