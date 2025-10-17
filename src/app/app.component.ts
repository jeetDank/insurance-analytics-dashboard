import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IconsModule } from './common/components/icon/icons.module';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ScrollTopModule } from 'primeng/scrolltop';


@Component({
  selector: 'app-root',
  imports: [ScrollTopModule,RouterOutlet,IconsModule,CommonModule,ButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'agentic-ai-analytics-app';
}
