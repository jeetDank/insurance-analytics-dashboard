import { Component } from '@angular/core';
import {SelectModule} from 'primeng/select'
import {ButtonModule} from 'primeng/button'
import {MessageModule} from 'primeng/message'
import { IconsModule } from '../../common/components/icon/icons.module';
import { CardSkeletonComponent } from '../../common/components/card-skeleton/card-skeleton.component';
import { CommonModule } from '@angular/common';
import { InsightsComponent } from '../../common/components/insights/insights.component';

@Component({
  selector: 'app-semantic-testing',
  imports: [InsightsComponent,SelectModule, ButtonModule, MessageModule, IconsModule, CardSkeletonComponent, CommonModule],
  templateUrl: './semantic-testing.component.html',
  styleUrl: './semantic-testing.component.scss'
})
export class SemanticTestingComponent {
skeletonVisible:boolean = true;

  constructor(){
      setTimeout(() => {
        this.skeletonVisible = false;
      }, 5000);
  }
}
