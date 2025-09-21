import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IconsModule } from './common/components/icon/icons.module';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SidebarComponent } from './common/components/sidebar/sidebar.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet,IconsModule,CommonModule,ButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'agentic-ai-analytics-app';
}
