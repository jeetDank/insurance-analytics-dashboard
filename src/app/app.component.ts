import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IconsModule } from './common/components/icon/icons.module';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ScrollTopModule } from 'primeng/scrolltop';
import { ThemeService } from './common/services/theme.service';


@Component({
  selector: 'app-root',
  imports: [ScrollTopModule,RouterOutlet,IconsModule,CommonModule,ButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'agentic-ai-analytics-app';
constructor(private themeService: ThemeService) {}

ngOnInit() {
    this.themeService.loadSavedTheme();
  }

  toggleTheme() {
    // Switch between light and dark
    const currentTheme = localStorage.getItem('theme');
    const newTheme = currentTheme?.includes('dark') 
      ? 'aura-light-blue' 
      : 'aura-dark-blue';
    this.themeService.switchTheme(newTheme);
  }
}
