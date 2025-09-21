import { Component } from '@angular/core';
import { PageTitleComponent } from '../page-title/page-title.component';
import { IconsModule } from "../icon/icons.module";
import { SelectModule } from 'primeng/select';
import {ButtonModule} from 'primeng/button'
import { DividerModule } from 'primeng/divider';
import { AvatarModule} from 'primeng/avatar'
import { SkeletonModule } from 'primeng/skeleton';
import { CardSkeletonComponent } from '../card-skeleton/card-skeleton.component';

@Component({
  selector: 'app-sidebar',
   imports: [PageTitleComponent,IconsModule,SelectModule,ButtonModule,DividerModule,AvatarModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
showFiller:any=false

}
