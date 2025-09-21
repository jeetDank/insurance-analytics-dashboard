import { Component } from '@angular/core';
import {SelectModule} from 'primeng/select'
import {ButtonModule} from 'primeng/button'
import {MessageModule} from 'primeng/message'
import { IconsModule } from '../../common/components/icon/icons.module';
import { CardSkeletonComponent } from '../../common/components/card-skeleton/card-skeleton.component';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-formula-results',
  imports:  [InputTextModule,SelectModule, ButtonModule, MessageModule, IconsModule, CardSkeletonComponent, CommonModule],
  templateUrl: './formula-results.component.html',
  styleUrl: './formula-results.component.scss'
})
export class FormulaResultsComponent {

  skeletonVisible:boolean = true;

  constructor(){
      setTimeout(() => {
        this.skeletonVisible = false;
      }, 5000);
  }

}
