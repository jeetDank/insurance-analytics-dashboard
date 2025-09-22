import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { IconsModule } from '../../common/components/icon/icons.module';
import { TextareaModule } from 'primeng/textarea';
import { PageTitleComponent } from '../../common/components/page-title/page-title.component';

@Component({
  selector: 'app-ask-ai-anything',
  imports: [ButtonModule,MessageModule,IconsModule,TextareaModule,PageTitleComponent],
  templateUrl: './ask-ai-anything.component.html',
  styleUrl: './ask-ai-anything.component.scss'
})
export class AskAiAnythingComponent {

  skeletonVisible:boolean = false;

}
